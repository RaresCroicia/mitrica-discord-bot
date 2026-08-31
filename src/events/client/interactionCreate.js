module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        const raspuns = { content: `Ceva o mers prost`, ephemeral: true };
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp(raspuns).catch(() => {});
        } else {
          await interaction.reply(raspuns).catch(() => {});
        }
      }
    }
  },
};
