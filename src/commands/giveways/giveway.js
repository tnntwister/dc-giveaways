const { SlashCommandBuilder } = require('@discordjs/builders');
const Giveaway = require('../../models/giveaway.js');
// const { GiveawayMember } = require('../../models/giveaway.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Lancer un giveway.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Identifiant du giveaway')
                .setRequired(true)),
    async execute(interaction, client) {
        const guild = await client.guilds.fetch(interaction.guildId);
        
        const giveaway = new Giveaway(guild.id, interaction.options.getString('id'));
        await giveaway.retrieve();
        giveaway.pickWinner();
        const winnerId = giveaway.winnerId;
        const winner = await guild.members.fetch(winnerId);
        if (winner == null) {
            await interaction.reply({ content: `Aucun gagnant trouvé`, ephemeral: false });
            return;
        }
        console.log(winner.user);
        await interaction.reply({ content: `Le gagnant est ${winner.user.username}`, ephemeral: false });
    },
};