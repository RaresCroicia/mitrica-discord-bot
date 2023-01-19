const { SlashCommandBuilder } = require('discord.js');

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

            const replies = ["Da barosanu meu tras prin scula lu' zeus, normal!", "Nu, ghertoi imputit, tu esti definita ghertoiului din dictionar pentru toate sensurile lui"];

            await interaction.editReply({
                content: "Intrebarea la care ma pui sa raspund: " + interaction.options.getString("question") + "\n" + replies[Math.floor(Math.random() * replies.length)] 
            });
    }
}