// Apeluri Ollama comune. Ollama tine un singur model incarcat: cand bills citeste un bon (glm-ocr / qwen3:8b),
// cererea noastra asteapta la coada pana se termina pasul lui, apoi o schimbare de model (10-50 s pe serverul
// asta). De aceea timeout-ul e generos si, daca dureaza, omul primeste un mesaj interimar in loc de tacere.
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama.media.svc.cluster.local:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';
const TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS) || 240 * 1000;
const BUSY_AFTER_MS = Number(process.env.OLLAMA_BUSY_AFTER_MS) || 20 * 1000;
const MESAJ_OCUPAT = 'Stai un pic, mi-e neuronul ocupat cu altceva (probabil citeste un bon). Astept la rand...';

// POST /api/generate cu model si stream:false implicite. Daca raspunsul nu vine in BUSY_AFTER_MS, apeleaza onBusy() o data.
async function generate(body, onBusy) {
    const timer = onBusy ? setTimeout(() => Promise.resolve().then(onBusy).catch((e) => console.warn('Mesajul interimar a esuat:', e.message)), BUSY_AFTER_MS) : null;
    try {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: OLLAMA_MODEL, stream: false, ...body }),
            signal: AbortSignal.timeout(TIMEOUT_MS)
        });
        if (!response.ok) throw new Error(`Ollama a raspuns cu status ${response.status}`);
        return await response.json();
    } finally {
        if (timer) clearTimeout(timer);
    }
}

// mesajul interimar pentru o interactiune deja amanata (deferReply)
function mesajOcupat(interaction) {
    return () => interaction.editReply({ content: MESAJ_OCUPAT });
}

module.exports = { OLLAMA_URL, OLLAMA_MODEL, TIMEOUT_MS, generate, mesajOcupat };
