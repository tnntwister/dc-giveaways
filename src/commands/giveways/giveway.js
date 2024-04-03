const { SlashCommandBuilder } = require('@discordjs/builders');
const Giveaway = require('../../models/giveaway.js');
const { memberProfile } = require('../../helpers/ids.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Lancer un giveway.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Identifiant du giveaway')
                .setRequired(true)),
    async execute(interaction, client) {
        /**
         * gestion des droits
         */
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            await interaction.reply({ content: `Vous n'avez pas les droits pour effectuer cette action`, ephemeral: true });
            return;
        }
        /**
         * début de l'exécution
         */
        const guild = await client.guilds.fetch(interaction.guildId);
        
        const giveaway = new Giveaway(guild.id, interaction.options.getString('id'));
        await giveaway.retrieve();
        await giveaway.pickWinner();
        
        let winner;
        try {
            winner = await guild.members.fetch(giveaway.winnerId);
        } catch (error) {
            console.log('members list', winner);
            console.error(`Aucun membre trouvé avec l'ID ${giveaway.winnerId}`);
        }

        if (!winner) {
            await interaction.reply({ content: `Aucun gagnant trouvé`, ephemeral: false });
            return;
        }
        
        await interaction.reply({ content: `Le gagnant du giveaway ${giveaway.slug} est ${memberProfile(winner)}`, ephemeral: false });
    },
};