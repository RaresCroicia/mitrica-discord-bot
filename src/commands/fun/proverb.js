const { SlashCommandBuilder } = require('discord.js');
const PROVERBE = require('../../data/proverbe.js');
const ollama = require('../../lib/ollama');

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

async function proverbCuLLM(alese, onBusy) {
    const data = await ollama.generate({
            prompt: 'Uite proverbele:\n' + alese.map(p => '- ' + p).join('\n'),
            options: { temperature: 1.1 },
            system: 'Esti Mitrica, un bot de Discord roman dus cu pluta. Primesti o lista de proverbe romanesti si creezi UN SINGUR proverb nou, scurt (maxim 20 de cuvinte), amestecand bucati si idei din ele. Proverbul trebuie sa sune ca o intelepciune populara autentica, spusa cu toata seriozitatea, dar sa fie complet absurd si fara sens - o petarda totala. Nu explica nimic, nu pune ghilimele, raspunde DOAR cu proverbul in romana.'
        }, onBusy);
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
                proverb = await proverbCuLLM(alese, ollama.mesajOcupat(interaction));
            } catch (err) {
                console.error('Eroare la /proverb (Ollama), folosesc fallback:', err.message);
                proverb = frankenstein(alese);
            }

            await interaction.editReply({
                content: proverb.slice(0, 2000)
            });
    }
}
