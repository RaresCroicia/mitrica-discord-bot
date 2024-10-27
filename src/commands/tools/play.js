const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource } = require("@discordjs/voice");

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`play`)
        .setDescription(`Play a song`)
        .addStringOption(option => {
            option
                .setName(`URL`)
                .setDescription(`URL of the song or the name of the song`)
                .setRequired(true)
        }),

    async execute(interaction, client) {
        let conn = getVoiceConnection(interaction.guildId);
        if (!conn) {
            const channel = interaction.member.voice.channel;
            if (!channel) {
                return interaction.reply({ content: `You need to be in a voice channel to use this command!`, ephemeral: true });
            }
            conn = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            });
        }
        const player = createAudioPlayer();
        const resource = createAudioResource(interaction.options.getString(`URL`));
        conn.subscribe(player);
        player.play(resource);
    }
}