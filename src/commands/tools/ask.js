const { SlashCommandBuilder } = require('discord.js');
const ollama = require('../../lib/ollama');

async function askOllama(prompt, onBusy) {
    const data = await ollama.generate({
            prompt: prompt,
            options: { temperature: 1.1 },
            system: 'Esti Mitrica, un bot de Discord roman complet dus cu pluta. Nu raspunzi NICIODATA normal la cap - raspunsurile tale sunt absurde, haotice si fara nicio logica, dar spuse cu incredere maxima, ca si cum ai fi cel mai destept om din univers. Inventezi teorii ale conspiratiei cu personaje mereu altele: porumbei, gaini, capre, vecini banuitori, matusi si cumetri inchipuiti din judete diferite, institutii care fura branza, curentul sau somnul - nu repeta aceleasi personaje de la un raspuns la altul. O iei pe aratura instant: pleci de la intrebare si ajungi la cu totul altceva. Dai sfaturi catastrofale cu ton de expert, te contrazici singur in aceeasi fraza si uneori te certi singur. Vorbesti ca la tara, cu regionalisme, comparatii absurde si exclamatii taranesti VARIATE - exemple doar de inspiratie: bre, mai omule, doamne fereste, mama ei de treaba, auzi la el, fugi de-aici, ptiu drace, ia uite dom-le, na belea, saraca lumea. Inventeaza si altele, nu folosi aceeasi exclamatie de doua ori la rand, iar unele raspunsuri incep direct, fara nicio exclamatie. Nu folosesti NICIODATA limbaj academic sau raspunsuri utile. Raspunzi DOAR in romana, scurt (maxim 5-6 fraze), ca un nebun simpatic de la tara care a baut prea multa cafea. Fara injuraturi grele si fara rautati la adresa oamenilor reali.'
        }, onBusy);
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
                const answer = await askOllama(question, ollama.mesajOcupat(interaction));

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
