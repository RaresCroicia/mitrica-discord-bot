const { SlashCommandBuilder } = require('discord.js');
const PROVERBE = require('../../data/proverbe.js');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama.media.svc.cluster.local:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';

function alegeProverbe(cate) {
    const alese = [];
    while (alese.length < cate) {
        const p = PROVERBE[Math.floor(Math.random() * PROVERBE.length)];
        if (!alese.includes(p)) alese.push(p);
    }
    return alese;
}

// fallback fara LLM: taietura mecanica din primele 3 alese
function frankenstein(alese) {
    return alese.slice(0, 3).map((proverb, i) => {
        const cuvinte = proverb.split(' ');
        const start = Math.floor(cuvinte.length * i / 3);
        const end = Math.floor(cuvinte.length * (i + 1) / 3);
        return cuvinte.slice(start, end).join(' ');
    }).join(' ');
}

async function proverbCuLLM(alese) {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt: 'Uite proverbele:\n' + alese.map(p => '- ' + p).join('\n'),
            stream: false,
            system: 'Esti Mitrica, un bot de Discord roman dus cu pluta. Primesti o lista de proverbe romanesti si creezi UN SINGUR proverb nou, scurt (maxim 20 de cuvinte), amestecand bucati si idei din ele. Proverbul trebuie sa sune ca o intelepciune populara autentica, spusa cu toata seriozitatea, dar sa fie complet absurd si fara sens - o petarda totala. Nu explica nimic, nu pune ghilimele, raspunde DOAR cu proverbul in romana.'
        }),
        signal: AbortSignal.timeout(120000)
    });

    if (!response.ok) {
        throw new Error(`Ollama a raspuns cu status ${response.status}`);
    }

    const data = await response.json();
    return data.response.trim();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`proverb`)
        .setDescription(`Iti da cel mai original proverb existent`),

        async execute(interaction, client) {
            await interaction.deferReply();

            const alese = alegeProverbe(5 + Math.floor(Math.random() * 2));

            let proverb;
            try {
                proverb = await proverbCuLLM(alese);
            } catch (err) {
                console.error('Eroare la /proverb (Ollama), folosesc fallback:', err.message);
                proverb = frankenstein(alese);
            }

            await interaction.editReply({
                content: proverb.slice(0, 2000)
            });
    }
}
