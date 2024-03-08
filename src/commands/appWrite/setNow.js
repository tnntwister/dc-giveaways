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
require('../../models/gangs.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-now')
        .setDescription('Enregistre le message affiché par la commande now.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Le message à enregistrer')
                .setRequired(true)),
        async execute(interaction) {
            const message = interaction.options.getString('message');

            // on cherche le gang dont le member id est leader, s'il n'en trouve pas une erreur est levée
            const gangs = await databases.listDocuments(appWriteConfig.databaseId, appWriteConfig.gangCollection, ['leaderId', '==', interaction.user.id]);
            console.log(gangs)
        
        /*if (gangs.documents.length === 0) {
            await interaction.reply({ content: 'Vous n\'êtes pas le leader d\'un gang.', ephemeral: true });
            return;
        } else if (gangs.documents.length > 1) {
            await interaction.reply({ content: 'Vous êtes le leader de plusieurs gangs. Veuillez contacter un administrateur.', ephemeral: true });
            return;
        } else {
            const gang = new Gang(interaction.channelId, gangs.documents[0].$id);
            await gang.sync(gangs.documents[0].$id);
            gang.setNow(message);
            gang.update();
            await interaction.reply({ content: `Message sauvegardé`, ephemeral: true });
        }*/
    },
};