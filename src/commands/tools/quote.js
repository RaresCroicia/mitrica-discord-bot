const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },
    }
);

const Quote = mongoose.model("quotes", QuoteSchema);

module.exports = {
    data: new SlashCommandBuilder()
        .setName(`quote`)
        .setDescription(`Un quote random`),

    async execute(interaction, client) {
        const message = await interaction.deferReply({
            fetchReply: true,
            ephemeral: false
        });

        const quotes = await (await Quote.find({}));

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        await interaction.editReply({
            content: `${randomQuote.text} - ${randomQuote.author} `
        });
    }
}