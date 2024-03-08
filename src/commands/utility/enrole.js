const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('enrole')
		.setDescription('Provides information about the server.')
        .addStringOption(option =>
            option.setName('trigger')
                .setDescription('the espanso trigger')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL of the discord message to send')
                .setRequired(true)),
	async execute(interaction, client) {
        const urlparts = interaction.options.getString('url').split('/');
        const messageId = urlparts[urlparts.length - 1];
        const channelId = urlparts[urlparts.length - 2];
        const guildId = urlparts[urlparts.length - 3];
        
        if (messageId !== undefined && channelId !== undefined && guildId !== undefined) {
            const guild = await client.guilds.fetch(guildId);
            const channel = await guild.channels.fetch(channelId);
            const message = await channel.messages.fetch(messageId);
            const prompt = interaction.options.getString('trigger');
            const response = message.content;
            // updateEspansoConfig(prompt, response);
            await interaction.reply({ content: `J'ai envoyé le prompt ${prompt} à l'API`, ephemeral: true });
        }
		// await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
	},
};