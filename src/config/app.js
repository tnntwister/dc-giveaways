require('dotenv').config();

const language = (process.env.DEFAULT_LANGUAGE) ? process.env.DEFAULT_LANGUAGE : 'fr';

module.exports = {
    language: language,
};