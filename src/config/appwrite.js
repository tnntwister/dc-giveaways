require('dotenv').config();

module.exports = {
    endpoint: process.env.APPWRITE_ENDPOINT,
    projectId: process.env.APPWRITE_PROJECT_ID,
    apiKey: process.env.APPWRITE_SECRET,
    databaseId: process.env.APPWRITE_DATABASE,
    giveawayCollection: process.env.GIVEAWAY_COLLECTION,
    membersCollection: process.env.MEMBERS_COLLECTION
};