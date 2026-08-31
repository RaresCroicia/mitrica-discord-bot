require("dotenv").config();
const token = process.env.MITRICA_TOKEN;
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const mongoose = require("mongoose");

const client = new Client({ intents: GatewayIntentBits.Guilds });
client.commands = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of functionFiles) {
    require(`./functions/${folder}/${file}`)(client);
  }
}

client.handleEvents();
client.handleCommands();
client.login(token);

if (process.env.MONGO_URL) {
  mongoose.connect(process.env.MONGO_URL, (err) => {
    if (err) console.error("Nu m-am putut conecta la mongolau:", err.message);
    else console.log("Conectat la mongolau");
  })
} else {
  console.log("MONGO_URL nu e setat, pornesc fara mongolau (quote/cuminvat dezactivate)");
}