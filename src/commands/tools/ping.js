const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`ping`)
        .setDescription(`Returns mitrica's ping`),

        async execute(interaction, client) {
            const message = await interaction.deferReply({
                fetchReply: true
            });

            const newMessage = `Gandesc o informatie in ${client.ws.ping} ani\nTu o primesti in ${message.createdTimestamp - interaction.createdTimestamp} ani`;
            await interaction.editReply({
                content: newMessage
            });
    }
}