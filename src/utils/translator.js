
const YAML = require('js-yaml');
const fs = require('fs');

class Translator {
  constructor() {
    this.languages = {};
    this.loadLanguages();
  }

  loadLanguages() {
    const localesDir = './locales/';
    const filenames = fs.readdirSync(localesDir);
    filenames.forEach((filename) => {
      const language = filename.split('.')[0];
      const fileContents = fs.readFileSync(localesDir + filename, 'utf8');
      this.languages[language] = YAML.load(fileContents);
    });
  }

  translate(key, language, variables = {}) {
    let translation = this.languages[language][key];
    Object.keys(variables).forEach(varName => {
      translation = translation.replace(`{{${varName}}}`, variables[varName]);
    });
    return translation;
  }
}

module.exports = new Translator();