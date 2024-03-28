const { SlashCommandBuilder } = require('@discordjs/builders');
require('../../models/giveaway.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Lancer un giveway.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Identifiant du giveway')
                .setRequired(true)),
    async execute(interaction, client) {
        const guild = await client.guilds.fetch(interaction.guildId);
        
        const giveaway = new Giveaway(guild.id, interaction.options.getString('id'));
        await giveaway.retrieve();
        giveaway.pickWinner();
        const winnerId = giveaway.winnerId;
        const winner = await guild.members.fetch(winnerId);
        await interaction.reply({ content: `Le gagnant est ${winner.user.username}`, ephemeral: false });
    },
};