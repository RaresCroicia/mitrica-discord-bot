const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`plesneala`)
        .setDescription(`te nenoroceste`),

        async execute(interaction, client) {
            const message = await interaction.deferReply({
                fetchReply: true,
                ephemeral: false
            });

            const newMessage = `*slap*`;
            await interaction.editReply({
                content: newMessage,
                
            });
        }
}