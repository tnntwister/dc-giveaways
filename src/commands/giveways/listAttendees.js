const { SlashCommandBuilder } = require('@discordjs/builders');
const Giveaway = require('../../models/giveaway.js');
const { memberProfile } = require('../../helpers/ids.js');
const translator = require('../../utils/translator');
const appConfig = require('../../config/app');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-attendees')
        .setDescription('Get list of all giveaway attendees.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Identifiant du giveway')
                .setRequired(true)),
    async execute(interaction, client) {
        /**
         * gestion des droits
         */
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            await interaction.reply({ content: translator.translate('forbidden_message', appConfig.language), ephemeral: true });
            return;
        }
        /**
         * début de l'exécution
         */
        const guild = await client.guilds.fetch(interaction.guildId);

        const giveaway = new Giveaway(guild.id, interaction.options.getString('id'));
        await giveaway.retrieve();

        // get the list of all members
        let giveawayMembers = await giveaway.retrieveMembers();

        if (giveawayMembers.length === 0) {
            await interaction.reply({ content:  translator.translate('attendees_noresults', appConfig.language, { giveawayName: giveaway.slug }), ephemeral: true });
            return;
        }
       
        // create a string with all members that won
        giveawayMembers = giveawayMembers.filter(member => member.win === false);
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

        await interaction.reply({ content: translator.translate('attendees_message', appConfig.language, { giveawayName: giveaway.slug, message:message }), ephemeral: true });
    },
};