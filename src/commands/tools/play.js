const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require("@discordjs/voice");
const playdl = require('play-dl');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song')
        .addStringOption(option =>
            option.setName("url").setDescription("URL of the song").setRequired(true)
        ),

    async execute(interaction) {
        await interaction.reply("Preparing to play your song...");

        try {
            // Ensure voice channel connection
            let conn = getVoiceConnection(interaction.guildId);
            if (!conn) {
                const channel = interaction.member.voice.channel;
                if (!channel) {
                    return interaction.followUp("Please join a voice channel first!");
                }
                conn = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator
                });
                console.log("Connected to voice channel.");
            }

            // Fetch the URL and create audio resource
            const url = interaction.options.getString("url");
            const stream = await playdl.stream(url);
            console.log("Audio stream fetched:", stream);
            const resource = createAudioResource(stream.stream, { inputType: stream.type });
            console.log("Audio resource created:", resource);

            // Create and configure audio player
            const player = createAudioPlayer();
            conn.subscribe(player); // Subscribe connection to the player
            console.log("Player subscribed to connection.");

            player.play(resource); // Start playback
            console.log("Playback initiated.");

            // Listen for player state changes
            player.on(AudioPlayerStatus.Playing, () => {
                console.log("AudioPlayerStatus: Playing");
                interaction.followUp("Now playing your song!");
            });

            player.on(AudioPlayerStatus.Idle, () => {
                console.log("AudioPlayerStatus: Idle - Playback finished.");
            });

            // Handle player errors
            player.on('error', error => {
                console.error("Playback error:", error);
                interaction.followUp("An error occurred during playback.");
            });

            // Monitor voice connection status changes
            conn.on(VoiceConnectionStatus.Ready, () => {
                console.log("VoiceConnectionStatus: Ready to play audio!");
            });

            conn.on(VoiceConnectionStatus.Disconnected, () => {
                console.log("VoiceConnectionStatus: Disconnected");
            });

        } catch (error) {
            console.error("Error:", error);
            interaction.followUp(`Error occurred: ${error.message}`);
        }
    }
};
