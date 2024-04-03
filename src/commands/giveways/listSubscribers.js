const { SlashCommandBuilder } = require('@discordjs/builders');
const Giveaway = require('../../models/giveaway.js');
const { memberProfile } = require('../../helpers/ids.js');

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
        const memberIds = giveawayMembers.map(member => member.memberId);
        const members = await guild.members.fetch({ user: memberIds });

        // Construct message with mentions
        let message = "";
        const membersCnt = members.size;
        let cnt = 1;

        members.forEach(member => {
            // Use guild-specific displayName and mention format for clickable link
            message += memberProfile(member);
            if (cnt <= membersCnt - 1) {
                message += "/";
            }
            cnt++;
        });

        await interaction.reply({ content: `Inscrits pour ${giveaway.slug}: ${message}`, ephemeral: true });
    },
};