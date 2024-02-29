require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
// const { updateEspansoConfig } = require('./espansoConfig');
const { commandsListData, command1Action } = require('./commands.mjs');
 
// Initialize Discord Bot
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

/**
 * Registers the 'push-prompt' slash command and adds it globally when 
 * the bot is ready. The command allows sending a prompt with trigger
 * and content to the espanso prompt queue.
 */
client.once('ready', async () => {
    console.log('Enrole bot ready !', `Logged in as ${client.user.tag}!`);
 
    // Adding the command globally
    await client.application.commands.create(commandsListData);
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
        command1Action(interaction);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
