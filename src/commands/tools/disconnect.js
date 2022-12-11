const { SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");
const guildId = "1050118228443156553";

module.exports = {
  data: new SlashCommandBuilder()
    .setName(`disconnect`)
    .setDescription(`Il trimite pe mitrica la plimbare!`),

  async execute(interaction, client) {
    const connection = getVoiceConnection(guildId);
    if (connection) {
      connection.destroy();
      const message = await interaction.deferReply({
        fetchReply: true,
        ephemeral: false
      });

      const mesaj = `M-a dat taranul de ${interaction.member.user} afara`;
      await interaction.editReply({
        content: mesaj
      });
    } else {
      await interaction.deferReply({
        fetchReply: true,
        ephemeral: false
      });
      await interaction.editReply({
        content: `Esti retardat? Nu sunt conectat!`
      });
    }
  },
};
