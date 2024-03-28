const appWriteConfig = require('../../config/appwrite.js');
const sdk = require('node-appwrite');
const appWriteClient = new sdk.Client();
const databases = new sdk.Databases(appWriteClient);

appWriteClient
.setEndpoint(appWriteConfig.endpoint) 
.setProject(appWriteConfig.projectId)
.setKey(appWriteConfig.apiKey) 
;

const { SlashCommandBuilder } = require('@discordjs/builders');
require('../../models/giveaway.js');

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

        const winnerId = giveaway.winnerId;
        const winner = await guild.members.fetch(winnerId);
        await interaction.reply({ content: `Le gagnant est ${winner.user.username}`, ephemeral: false });
    },
};