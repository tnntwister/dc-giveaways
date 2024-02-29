require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const { updateEspansoConfig } = require('./espansoConfig');

// Initialize Discord Bot
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

/**
 * Registers the 'push-prompt' slash command and adds it globally when 
 * the bot is ready. The command allows sending a prompt with trigger
 * and content to the espanso prompt queue.
 */
client.once('ready', async () => {
    console.log('Discord bot ready !', `Logged in as ${client.user.tag}!`);
 
    const autoPromptData = new SlashCommandBuilder()
    .setName('auto-prompt')
    .setDescription('Sends prompt message to API')
    .addStringOption(option =>
        option.setName('trigger')
            .setDescription('the espanso trigger')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('url')
            .setDescription('URL of the discord message to send')
            .setRequired(true));
        
    // Adding the command globally
    await client.application.commands.create(autoPromptData);
});

/**
 * Handles interactions from Discord slash commands.
 * If the interaction is from the 'auto-prompt' command, 
 * extract the url from the options, 
 * get the message content and send it to API
*/
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    // when the interaction is from the 'auto-prompt' command, extract the url from the options, get the message content and send it to API
    if (interaction.commandName === 'auto-prompt') {
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
            updateEspansoConfig(prompt, response);
            await interaction.reply({ content: `J'ai envoyé le prompt ${prompt} à l'API`, ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
