const fs = require("fs");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandFolders = fs.readdirSync("./src/commands");
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

      const { commands, commandArray } = client;
      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        commands.set(command.data.name, command);
        commandArray.push(command.data.toJSON());
      }
    }

    const clientId = '1051223191525277697';
    const guildId = '1050118228443156553';
    const rest = new REST({version: '9'}).setToken(process.env.MITRICA_TOKEN);

    try {
      console.log("Se actualizeaza comenzile");
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: client.commandArray,
      })

    } catch (error) {
      console.error(error);
    }

  };
};
