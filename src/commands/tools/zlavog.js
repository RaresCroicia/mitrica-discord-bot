const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`zlavog`)
        .setDescription(`Te agata in stil original`),

        async execute(interaction, client) {
            const message = await interaction.deferReply({
                fetchReply: true
            });

            const newMessage = `Crapa-ti-aaas putaaaa`;
            await interaction.editReply({
                content: newMessage
            });
    }
}