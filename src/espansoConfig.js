const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const configPath = path.join(__dirname, 'espanso.yml');

// Function to read the current configuration or create a default one
function readCurrentConfig() {
    try {
        const currentConfig = yaml.load(fs.readFileSync(configPath, 'utf8'));
        return currentConfig || { matches: [] };
    } catch (error) {
        return { matches: [] }; // Return an empty config if file does not exist
    }
}

// Function to update the Espanso config file with new prompts
function updateEspansoConfig(prompt, response) {
    const currentConfig = readCurrentConfig();

    // Check if the prompt already exists
    const existingMatchIndex = currentConfig.matches.findIndex(match => match.trigger === prompt);
    if (existingMatchIndex !== -1) {
        currentConfig.matches[existingMatchIndex].replace = response;
    } else {
        currentConfig.matches.push({ trigger: prompt, replace: response });
    }

    // Write the updated configuration back to the file
    fs.writeFileSync(configPath, yaml.dump(currentConfig), 'utf8');
}

module.exports = { updateEspansoConfig };
