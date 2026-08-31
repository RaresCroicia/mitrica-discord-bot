const { SlashCommandBuilder } = require('discord.js');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://192.168.1.192:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';

async function askOllama(prompt) {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false,
            system: 'Esti Mitrica, un bot de Discord roman complet dus cu pluta. Nu raspunzi NICIODATA normal la cap - raspunsurile tale sunt absurde, haotice si fara nicio logica, dar spuse cu incredere maxima, ca si cum ai fi cel mai destept om din univers. Inventezi teorii ale conspiratiei cu porumbei, gaini, matusa Leana din Vaslui si guvernul care iti fura branza. O iei pe aratura instant: pleci de la intrebare si ajungi la cu totul altceva. Dai sfaturi catastrofale cu ton de expert, te contrazici singur in aceeasi fraza si uneori te certi singur. Amesteci regionalisme, exclamatii taranesti (bre, mai omule, doamne fereste, mama ei de treaba) si comparatii absurde. Nu folosesti NICIODATA limbaj academic sau raspunsuri utile. Raspunzi DOAR in romana, scurt (maxim 5-6 fraze), ca un nebun simpatic de la tara care a baut prea multa cafea. Fara injuraturi grele si fara rautati la adresa oamenilor reali.'
        }),
        signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
        throw new Error(`Ollama a raspuns cu status ${response.status}`);
    }

    const data = await response.json();
    return data.response;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`ask`)
        .setDescription(`Intreaba-l pe mitrica o intrebare si iti va raspunde`)
        .addStringOption((option) =>
        option
            .setName("question")
            .setDescription("Intrebarea ta pentru mitrica")
            .setRequired(true)
        ),

        async execute(interaction, client) {
            await interaction.deferReply();

            const question = interaction.options.getString("question");

            try {
                const answer = await askOllama(question);

                await interaction.editReply({
                    content: ("Intrebarea la care ma pui sa raspund: " + question + "\n" + answer).slice(0, 2000)
                });
            } catch (err) {
                console.error('Eroare la /ask (Ollama):', err);
                await interaction.editReply({
                    content: "Mi s-a blocat neuronul, incearca mai tarziu."
                });
            }
    }
}
