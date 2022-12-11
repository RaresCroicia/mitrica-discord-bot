const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`tacima`)
        .setDescription(`Te face sa taci`),

        async execute(interaction, client) {
            const message = await interaction.deferReply({
                fetchReply: true,
                ephemeral: false
            });
            
            

            const newMessage = `<:tacima:1051206423993921697>`;
            await interaction.editReply({
                content: newMessage
            });
    }
}