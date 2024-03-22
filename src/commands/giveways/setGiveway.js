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
        .setName('set-giveaway')
        .setDescription('Crée ou met à jour le giveaway (sur la base du nom)')
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Le nom donné au giveaway')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description donné au giveaway')
                .setRequired(true)),
        async execute(interaction) {
            const slug = interaction.options.getString('name');
            const summary = interaction.options.getString('description');

            const giveaway = new Giveaway(interaction.guildId);
        
    },
};