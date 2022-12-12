const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`adi`)
        .setDescription(`clasic aditu`),

        async execute(interaction, client) {
            const message = await interaction.deferReply({
                fetchReply: true
            });

            const newMessage = `S-a bulit sau m-am stricat eu la creier`;
            await interaction.editReply({
                content: newMessage
            });
    }
}