const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`birthdays`)
        .setDescription(`In cazul in care uiti cand e ziua mea!`),

        async execute(interaction, client) {
            const message = await interaction.deferReply({
                fetchReply: true
            });

            const birthdays = {
                "Adi" : "1 August",
                "Codrut" : "27 Aprilie",
                "Ramona" : "15 Octombrie",
                "Rares" : "30 Septembrie"
            }; // this is going to be converted in mongodb
            
            var replyMessage = "";
            for(var key in birthdays) {
                replyMessage += key + " cred ca s-o nascut pe " + birthdays[key] + "\n";
            }

            await interaction.editReply({
                content: replyMessage
            });
    }
}