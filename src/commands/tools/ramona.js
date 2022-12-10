const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`ramons`)
        .setDescription(`Clasic carbasanoasa`),

        async execute(interaction, client) {
            const message = await interaction.deferReply({
                fetchReply: true
            });

            const newMessage = `Am dat reply cu carbasanul ramonei, dar a trecut limita admisa si nu s-a trimis`;
            await interaction.editReply({
                content: newMessage
            });
    }
}