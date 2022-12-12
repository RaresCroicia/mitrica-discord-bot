const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`rares`)
        .setDescription(`face ce face rares mereu`),

        async execute(interaction, client) {
            const message = await interaction.deferReply({
                fetchReply: true
            });

            const newMessage = `Da dai si mie un leu?`;
            await interaction.editReply({
                content: newMessage
            });
    }
}