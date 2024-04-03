const { SlashCommandBuilder } = require('@discordjs/builders');
const Giveaway = require('../../models/giveaway.js');
const { memberProfile } = require('../../helpers/ids.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('last-giveaway')
        .setDescription('Get the last winner.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Identifiant du giveway')
                .setRequired(true)),
    async execute(interaction, client) {
        const guild = await client.guilds.fetch(interaction.guildId);

        const giveaway = new Giveaway(guild.id, interaction.options.getString('id'));
        await giveaway.retrieve();

        if (giveaway.now == '') {
            await interaction.reply({ content: `Aucun gagnant trouvé`, ephemeral: false });
            return;
        }
        // remplacer l'identifiant utilisateur dans giveaway.now par le nom de l'utilisateur
        let winner;
        let userId = giveaway.now.match(/u\d+u/)[0];
        userId = userId.substring(1, userId.length - 1);
        try {
            winner = await guild.members.fetch(userId);
            giveaway.now = giveaway.now.replace('u'+userId+'u', memberProfile(winner));
        } catch (error) {
            console.error(`Aucun membre trouvé avec l'ID ${userId}`);
        }

        await interaction.reply({ content: `${giveaway.now}`, ephemeral: false });
    },
};