const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema(
    {
        answer: {
            type: String,
            required: true
        }
    }
);

const Answers = mongoose.model("answers", AnswerSchema);

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`ask`)
        .setDescription(`Intreaba-l pe mitrica o intrebare si iti va raspunde da sau nu`)
        .addStringOption((option) => 
        option
            .setName("question")
            .setDescription("Intrebarea ta pentru mitrica va primi raspunsul da sau nu")
            .setRequired(true)
        ),

        async execute(interaction, client) {
            const message = await interaction.deferReply({
                fetchReply: true
            });

            const answers = await Answers.find({});

            const replies = answers.map(a => a.answer);

            await interaction.editReply({
                content: "Intrebarea la care ma pui sa raspund: " + interaction.options.getString("question") + "\n" + replies[Math.floor(Math.random() * replies.length)] 
            });
    }
}
