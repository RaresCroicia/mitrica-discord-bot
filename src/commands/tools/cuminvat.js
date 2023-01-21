const { SlashCommandBuilder } = require('discord.js');
const { default: mongoose } = require('mongoose');

const MethodSchema = new mongoose.Schema(
    {
        method: {
            type: String,
            required: true
        }
    }
);

const Methods = mongoose.model("methods", MethodSchema);

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`cuminvat`)
        .setDescription(`Iti zice cum sa inveti la o materie`)
        .addStringOption( option => 
            option
                .setName("materia")
                .setDescription("Materia la care vrei sa stii cum inveti")
                .setRequired(true)
        ),

        async execute(interaction, client) {
            const message = await interaction.deferReply({
                fetchReply: true
            });

            const methods = await Methods.find({});
            const methodsMapped = methods.map(m => m.method);
            const response = "Simplu frate, ca sa inveti la " + interaction.option.getString("materia") + " trebiue sa:\n" + methodsMapped[Math.floor(Math.random() * methodsMapped.length)];

            await interaction.editReply({
                content: response
            });
    }
}