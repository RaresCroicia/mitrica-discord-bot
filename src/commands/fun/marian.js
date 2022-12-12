const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`marian`)
        .setDescription(`Pune intrebarea!`),

        async execute(interaction, client) {
            const message = await interaction.deferReply({
                fetchReply: true
            });

            const newMessage = `Uite-l ba pe Marian\nCe faci ba Mariene?\nBem si noi o bere?`;
            await interaction.editReply({
                content: newMessage
            });
    }
}