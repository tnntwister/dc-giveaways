const { SlashCommandBuilder } = require('@discordjs/builders');
const Giveaway = require('../../models/giveaway.js');
// const { GiveawayMember } = require('../../models/giveaway.js');

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
                ),
        async execute(interaction) {
            const slug = interaction.options.getString('id');
            const summary = interaction.options.getString('description');

            const giveaway = new Giveaway(interaction.guildId, slug, summary);
            await giveaway.retrieve();

            // on met à jour le summary
            if (summary !== giveaway.summary && summary !== '') {
                giveaway.setSummary(summary);
                await giveaway.save();
            }            

            // on ajoute les membres qui sont dans la guilde
            const members = await interaction.guild.members.fetch();
            const memberList = [];
            members.forEach(member => {
                // restrictions aux membres actifs
                if (member.user.bot || member.user.system) {
                    return;
                }
                memberList.push(member.id);
            });
            await giveaway.addMembers(memberList);

            // traitement de la réponse
            const giveawayMembers = await giveaway.retrieveMembers();
            if (giveawayMembers.length === 0) {                
                await interaction.reply({ content: `L'ajout des membres n'a pas fonctionné pour ${giveaway.slug}`, ephemeral: true });
                return;
            }
            await interaction.reply({ content: `Le giveaway ${giveaway.slug} a été créé avec ${giveawayMembers.length} membres`, ephemeral: true });
    },
};