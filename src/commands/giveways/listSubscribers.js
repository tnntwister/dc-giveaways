const { SlashCommandBuilder } = require('@discordjs/builders');
const Giveaway = require('../../models/giveaway.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-subscribers')
        .setDescription('Get list of all giveaway subscribers.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Identifiant du giveway')
                .setRequired(true)),
    async execute(interaction, client) {
        const guild = await client.guilds.fetch(interaction.guildId);

        const giveaway = new Giveaway(guild.id, interaction.options.getString('id'));
        await giveaway.retrieve();

        // get the list of all members
        const giveawayMembers = await giveaway.retrieveMembers();

        if (giveawayMembers.length === 0) {
            await interaction.reply({ content: `Pas d'inscrits pour ${giveaway.slug}`, ephemeral: true });
            return;
        }
        // create a string with all members
        const memberIds = [];
        let message = "Inscrits pour le giveaway:";

        for (const member of giveawayMembers) {
                memberIds.push(member.memberId);    
        }

        const memberManager = guild.members;

        await memberManager.fetch({ user: memberIds })
        .then(members => {
            let mkey = 0;
            members.forEach(member => {
                // console.log(`Membre trouvé ${mkey}/${memberIds.length -1} : ${member.user.tag}`);
                message += (mkey <= memberIds.length - 2) ? member.user.tag + ', ' : member.user.tag;
                mkey++;
            });
        })
        .catch(console.error);

        await interaction.reply({ content: `Inscrits pour ${giveaway.slug}: ${message}`, ephemeral: true });
                
    },
};