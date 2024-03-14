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
        .setName('now')
        .setDescription('Get the now message.'),
    async execute(interaction, client) {
        const guild = await client.guilds.fetch(interaction.guildId);
        const member = await guild.members.fetch(interaction.user.id);
        // Get the member's roles
        const roles = member.roles.cache;

        if(roles.some(role => role.name === 'MC')){
            await interaction.reply({ content: `${member.user.username} est un maître de cérémonie`, ephemeral: false }); 
        }   
            
    },
};