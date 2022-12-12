const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`codrut`)
        .setDescription(`doar codrut poate scoate asa ceva pe bot`),

        async execute(interaction, client) {
            const message = await interaction.deferReply({
                fetchReply: true,
                ephemeral: false
            });

            const newMessage = `Buturuga mica nu poate sa fie si cu pula in cur cand merge de multe ori la apa!`;
            await interaction.editReply({
                content: newMessage,
                
            });
        }
}