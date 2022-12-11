const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
const guildId = "1050118228443156553";

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`connect`)
    .setDescription(`Connects mitrica`)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The Channel to join")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice)
    ),
  async execute(interaction, client) {
    const connection = getVoiceConnection(guildId);
    if (connection) {

      const message = await interaction.deferReply({
        fetchReply: true,
        ephemeral: false
      });

      const mesaj = `Sunt deja undeva, lasa-ma dracu!`;
      await interaction.editReply({
        content: mesaj
      });

    } else {
      const voiceConnection = joinVoiceChannel({
        channelId: interaction.options.getChannel("channel").id,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      const message = await interaction.deferReply({
        fetchReply: true,
        ephemeral: false
      });

      const mesaj = `Am intrat cu taranul de ${interaction.member.user} pe canal`;
      await interaction.editReply({
        content: mesaj
      });
    }
  },
};
