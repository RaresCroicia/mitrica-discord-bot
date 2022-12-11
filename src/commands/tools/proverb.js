const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

const ProverbeSchema = new mongoose.Schema(
    {
        first: {
            type: String,
            required: true,
        },
        last: {
            type: String,
            required: true,
        },
    }
);

const Proverbe = mongoose.model("proverbe", ProverbeSchema);

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`proverb`)
        .setDescription(`Iti da cel mai original proverb existent`),

        async execute(interaction, client) {
            const proverbe = await Proverbe.find({});

            const firstHalf = proverbe.map(p => p.first);
            const secondHalf = proverbe.map(p => p.last);
            const mesaj = firstHalf[Math.floor(Math.random() * firstHalf.length)] + ` ` + secondHalf[Math.floor(Math.random() * secondHalf.length)];
            
            await interaction.deferReply({
                fetchReply: true,
                ephemeral: false
            });
            
        
            await interaction.editReply({
                content: mesaj
            });
    }
}