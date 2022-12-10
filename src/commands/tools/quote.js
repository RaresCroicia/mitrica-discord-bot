const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`quote`)
        .setDescription(`Un quote random`),

        async execute(interaction, client) {
            const message = await interaction.deferReply({
                fetchReply: true
            });

            const quotes = [
                "Ma jur ca in pozitia asta nu mi-o luasem",
                "Cu forta frate? Forta steaua",
                "Vorbim de cocalar si cocalarul la samanta",
                "ce-a cazut, ce-a cazuuuut? Ah, pula"
            ];

            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            await interaction.editReply({
                content: randomQuote
            });
    }
}