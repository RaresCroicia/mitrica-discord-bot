const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource } = require("@discordjs/voice");

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`stop`)
        .setDescription(`stop playing a song`),

    async execute(interaction, client) {
        let conn = getVoiceConnection(interaction.guildId);
        if (conn) {
            conn.destroy();
            return interaction.reply({ content: `Stopped playing`, ephemeral: true });
        } else {
            return interaction.reply({ content: `I'm not playing anything`, ephemeral: true });
        }
    }
}