const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama.media.svc.cluster.local:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';
const COMFY_URL = process.env.COMFY_URL || 'http://comfyui.media.svc.cluster.local:8188';
const COMFY_CHECKPOINT = process.env.COMFY_CHECKPOINT || 'DreamShaper_8_pruned.safetensors';

const COOLDOWN_MS = 60 * 1000;   // per user
const COMFY_TIMEOUT_MS = 180 * 1000;

// GPU-ul e unul singur si VRAM-ul (6 GB) nu incape si qwen (4.7 GB) si SD 1.5 in acelasi timp.
// O singura generare o data; qwen se descarca inainte, ComfyUI se elibereaza dupa.
let ocupat = false;
const ultimaFolosire = new Map();

const NEGATIVE = 'blurry, lowres, bad anatomy, bad hands, extra fingers, deformed, watermark, text, signature, jpeg artifacts, cropped, worst quality, low quality';

const SYSTEM_VIZIUNE = 'Esti Mitrica, un bot de Discord roman complet dus cu pluta, care are "viziuni" - vede scene absurde in cap si le descrie. Primesti o cerere de la un om si raspunzi DOAR cu un obiect JSON cu doua campuri, "prompt" si "viziune".\n'
    + 'Regula pentru "prompt": o descriere de scena in ENGLEZA fluenta si corecta pentru Stable Diffusion. Subiectul cerut de om trebuie tradus EXACT si sa ramana elementul principal al scenei (pisoi = kitten, capra = goat, primar = mayor, etc.). In jurul lui adaugi 2-3 elemente absurde in spirit rural romanesc (de exemplu capre, gaini, porumbei, matusi cu batic, cumetri, primarii, branza, tractoare, blocuri comuniste, tarabe de piata - alege altele de fiecare data), UN stil vizual (de exemplu oil painting, cinematic photo, soviet propaganda poster, renaissance painting, 90s VHS still) si la final "highly detailed, dramatic lighting". Intre 30 si 60 de cuvinte, fraze scurte separate prin virgula, fara ghilimele in interior.\n'
    + 'Regula pentru "viziune": o singura fraza in ROMANA corecta gramatical, maxim 25 de cuvinte, in care Mitrica anunta cu incredere maxima ce a vazut. Foloseste CEL MULT o exclamatie taraneasca (bre, mai omule, doamne fereste, na belea, auzi la el, ptiu drace - una singura, sau niciuna). Fara injuraturi grele si fara rautati la adresa oamenilor reali.\n'
    + 'Exemplu pentru cererea "un pisoi care conduce un tractor": {"prompt": "a small kitten driving a rusty red tractor through a romanian village, chickens flying in panic, an old woman with a headscarf shaking her fist, soviet propaganda poster style, bold colors, highly detailed, dramatic lighting", "viziune": "Na belea, l-am vazut pe pisoi la volanul tractorului, iar gainile din Bacau n-o sa mai doarma vreodata."}';

async function viziuneCuLLM(cerere) {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt: 'Cererea omului: ' + cerere,
            system: SYSTEM_VIZIUNE,
            format: 'json',
            stream: false,
            options: { temperature: 1.1 }
        }),
        signal: AbortSignal.timeout(120000)
    });
    if (!response.ok) throw new Error(`Ollama a raspuns cu status ${response.status}`);
    const data = await response.json();
    const parsed = JSON.parse(data.response);
    if (!parsed.prompt || typeof parsed.prompt !== 'string') throw new Error('LLM fara prompt');
    return {
        prompt: parsed.prompt.slice(0, 600),
        viziune: typeof parsed.viziune === 'string' ? parsed.viziune.trim() : ''
    };
}

// fallback fara LLM: cererea omului direct, cu un pic de haos adaugat
function viziuneFallback(cerere) {
    const stiluri = ['oil painting', 'cinematic photo', 'soviet propaganda poster', 'renaissance painting', '90s VHS still'];
    const stil = stiluri[Math.floor(Math.random() * stiluri.length)];
    return {
        prompt: `${cerere}, with a suspicious goat watching, romanian village, ${stil}, highly detailed, dramatic lighting`,
        viziune: 'Mi s-a incalzit neuronul si am vazut-o pe scurt, uite ce-a iesit.'
    };
}

// Descarca qwen din VRAM (keep_alive 0). Urmatorul /ask il reincarca singur (~5s).
async function descarcaOllama() {
    try {
        await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: OLLAMA_MODEL, keep_alive: 0 }),
            signal: AbortSignal.timeout(30000)
        });
    } catch (err) {
        console.warn('Nu am putut descarca modelul Ollama:', err.message);
    }
}

// Reincarca qwen in fundal (fire-and-forget), altfel primul /ask dupa o imagine dureaza ~30s.
function preincalzesteOllama() {
    fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: OLLAMA_MODEL, prompt: 'Salut.', stream: false, options: { num_predict: 1 } }),
        signal: AbortSignal.timeout(120000)
    }).catch((err) => console.warn('Preincalzirea Ollama a esuat:', err.message));
}

// Elibereaza VRAM-ul ComfyUI ca sa aiba loc qwen la urmatorul /ask.
async function elibereazaComfy() {
    try {
        await fetch(`${COMFY_URL}/free`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unload_models: true, free_memory: true }),
            signal: AbortSignal.timeout(30000)
        });
    } catch (err) {
        console.warn('Nu am putut elibera ComfyUI:', err.message);
    }
}

function workflow(prompt, seed) {
    return {
        '4': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: COMFY_CHECKPOINT } },
        '5': { class_type: 'EmptyLatentImage', inputs: { width: 512, height: 512, batch_size: 1 } },
        '6': { class_type: 'CLIPTextEncode', inputs: { text: prompt, clip: ['4', 1] } },
        '7': { class_type: 'CLIPTextEncode', inputs: { text: NEGATIVE, clip: ['4', 1] } },
        '3': {
            class_type: 'KSampler',
            inputs: {
                seed, steps: 25, cfg: 7, sampler_name: 'dpmpp_2m', scheduler: 'karras', denoise: 1,
                model: ['4', 0], positive: ['6', 0], negative: ['7', 0], latent_image: ['5', 0]
            }
        },
        '8': { class_type: 'VAEDecode', inputs: { samples: ['3', 0], vae: ['4', 2] } },
        '9': { class_type: 'SaveImage', inputs: { filename_prefix: 'mitrica', images: ['8', 0] } }
    };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function genereazaImagine(prompt) {
    const seed = Math.floor(Math.random() * 2 ** 32);
    const queued = await fetch(`${COMFY_URL}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: workflow(prompt, seed), client_id: 'mitrica' }),
        signal: AbortSignal.timeout(30000)
    });
    if (!queued.ok) {
        throw new Error(`ComfyUI a refuzat workflow-ul: ${queued.status} ${(await queued.text()).slice(0, 300)}`);
    }
    const { prompt_id } = await queued.json();

    const deadline = Date.now() + COMFY_TIMEOUT_MS;
    while (Date.now() < deadline) {
        await sleep(1500);
        const res = await fetch(`${COMFY_URL}/history/${prompt_id}`, { signal: AbortSignal.timeout(10000) });
        if (!res.ok) continue;
        const hist = (await res.json())[prompt_id];
        if (!hist) continue;
        if (hist.status && hist.status.status_str === 'error') {
            const msg = JSON.stringify(hist.status.messages || '').slice(0, 300);
            throw new Error('ComfyUI a dat eroare: ' + msg);
        }
        const out = hist.outputs && hist.outputs['9'] && hist.outputs['9'].images && hist.outputs['9'].images[0];
        if (out) {
            const q = new URLSearchParams({ filename: out.filename, subfolder: out.subfolder || '', type: out.type || 'output' });
            const img = await fetch(`${COMFY_URL}/view?${q}`, { signal: AbortSignal.timeout(30000) });
            if (!img.ok) throw new Error(`Nu am putut lua imaginea: ${img.status}`);
            return Buffer.from(await img.arrayBuffer());
        }
    }
    throw new Error('ComfyUI nu a terminat in timp util');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('imagine')
        .setDescription('Mitrica are o viziune si o deseneaza (dureaza ~30s)')
        .addStringOption((option) =>
            option
                .setName('ce')
                .setDescription('Ce vrei sa vada Mitrica')
                .setRequired(true)
                .setMaxLength(300)
        ),

    async execute(interaction, client) {
        const cerere = interaction.options.getString('ce');

        const ultima = ultimaFolosire.get(interaction.user.id) || 0;
        const ramas = Math.ceil((ultima + COOLDOWN_MS - Date.now()) / 1000);
        if (ramas > 0) {
            await interaction.reply({ content: `Stai, bre, ca-mi fumega neuronul. Mai incearca in ${ramas} secunde.`, ephemeral: true });
            return;
        }
        if (ocupat) {
            await interaction.reply({ content: 'Am deja o viziune in lucru, nu pot avea doua deodata, nu-s Nostradamus.', ephemeral: true });
            return;
        }

        ocupat = true;
        ultimaFolosire.set(interaction.user.id, Date.now());
        await interaction.deferReply();

        try {
            let viziune;
            try {
                viziune = await viziuneCuLLM(cerere);
            } catch (err) {
                console.warn('LLM-ul n-a dat viziune, fallback:', err.message);
                viziune = viziuneFallback(cerere);
            }

            await descarcaOllama();
            let imagine;
            try {
                imagine = await genereazaImagine(viziune.prompt);
            } finally {
                await elibereazaComfy();
                preincalzesteOllama();
            }

            const attachment = new AttachmentBuilder(imagine, { name: 'viziune.png' });
            const text = `**${cerere}**\n${viziune.viziune}\n-# ${viziune.prompt}`;
            await interaction.editReply({ content: text.slice(0, 2000), files: [attachment] });
        } catch (err) {
            console.error('Eroare la /imagine:', err);
            await interaction.editReply({ content: 'Am vrut sa desenez, dar mi-a cazut creionul in fantana. Incearca mai tarziu.' });
        } finally {
            ocupat = false;
        }
    }
};
