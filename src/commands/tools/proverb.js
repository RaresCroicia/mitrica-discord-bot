const { SlashCommandBuilder } = require('discord.js');

module.exports = { 
    data: new SlashCommandBuilder()
        .setName(`proverb`)
        .setDescription(`Iti da cel mai original proverb existent`),

        async execute(interaction, client) {

            const firstHalf = [
                "A aduce apa",
                "A aduna nuiele",
                "Baba/Surdul n-aude",
                "Bine faci",
                "Boii batrani",
                "Buturuga mică",
                "Calul de dar",
                "Capul ce se pleacă",
                "Câinele care latră",
                "Câinele moare de drum lung",
                "Câinii latră",
                "Când doi se ceartă",
                "Când pisica nu-i acasă",
                "Când omul cade",
                "Când râde prostul",
                "Câte bordeie",
                "Ce naște din pisică",
                "Ce ție nu-ți place",
                "Ce-i în mână",
                "Cele rele să se spele",
                "Cine are carte",
                "Cine fură azi un ou",
                "Cine sapă groapa altuia",
                "Cine se frige cu ciorba",
                "Cine seamănă vânt",
                "Cine se aseamănă",
                "Cine se scoală de dimineață",
                "Cine se scuză",
                "Cine stă în casă de sticlă",
                "Mâța blândă",
                "Paza bună",
                "S-a dus bou",
                "Stăpânul zgârcit",
                "Unde-s mulți",
                "Vorba dulce",
                "Ce-și face omul singur",
                "Cum tu mie",
                "Dați cezarului",
                "Fă bine"
            ];

            const secondHalf = [
                "după ce s-a stins focul",
                "suge pula",
                "cu ou și cu oțet",
                "a-și bate cuie în talpă",
                "bine găsești",
                "fac brazda dreaptă",
                "răstoarnă carul mare",
                "nu se caută la dinți",
                "sabia nu-l taie",
                "ursul merge",
                "și prostul de grija altora",
                "al treilea câștigă",
                "șoarecii joacă pe masă",
                "înțeleptul suspină",
                "atâtea obiceie",
                "șoareci mănâncă",
                "altuia nu-i face",
                "nici dracul nu poate desface",
                "are parte",
                "parte își face",
                "să își cumpere",
                "culege furtună",
                "departe ajunge",
                "nu prinde niciunul",
                "așa eu ție",
                "ce-i al cezarului",
                "și așteaptă răul"
            ];
            
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