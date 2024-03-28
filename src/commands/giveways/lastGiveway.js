const { SlashCommandBuilder } = require('@discordjs/builders');
const Giveaway = require('../../models/giveaway.js');
// const { GiveawayMember } = require('../../models/giveaway.js');

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
        await interaction.reply({ content: `${giveaway.now}`, ephemeral: false });
    },
};