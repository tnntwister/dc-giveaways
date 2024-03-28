const { SlashCommandBuilder } = require('@discordjs/builders');
require('../../models/giveaway.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-giveaway')
        .setDescription('Crée ou met à jour le giveaway (sur la base du nom)')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Identifiant du giveaway')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description donné au giveaway')
                .setRequired(true)),
        async execute(interaction) {
            const slug = interaction.options.getString('name');
            const summary = interaction.options.getString('description');

            const giveaway = new Giveaway(interaction.guildId, slug, summary);
            await giveaway.retrieve();
            // on ajoute les membres qui sont dans la guilde
            const members = await interaction.guild.members.fetch();
            const memberList = [];
            members.forEach(member => {
                memberList.push(member.id);
            });
            await giveaway.addMembers(memberList);
            const giveawayMembers = await giveaway.retrieveMembers();
            if (giveawayMembers.length === 0) {
                throw new Error("L'ajout des membres n'a pas fonctionné");
            }
            await interaction.reply({ content: `Le giveaway ${giveaway.slug} a été créé avec ${giveawayMembers.length} membres`, ephemeral: true });
    },
};