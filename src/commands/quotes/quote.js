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
        if (!process.env.MONGO_URL) {
            return interaction.reply({
                content: "N-am baza de date, n-am quote-uri. Jumatate de neuron, zero memorie."
            });
        }

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