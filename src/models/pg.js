const pgConfig = require('../config/pg.js');
const { Pool } = require('pg');

class PG4Discord {
    constructor() {
        this.pool = new Pool({
            user: pgConfig.user,
            host: pgConfig.host,
            database: pgConfig.database,
            password: pgConfig.password,
            port: pgConfig.port
        });
    }

    async query(query, values = []) {
        try {
            const res = await this.pool.query(query, values);
            return res.rows;
        } catch (err) {
            console.error('Erreur lors de l\'exécution de la requête:', err);
        }
    }

    // create structure of the table
    /*async createGiveawaysTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS giveaways (
                id SERIAL PRIMARY KEY,
                summary TEXT,
                now VARCHAR(255),
                lastWinner VARCHAR(30),
                guildId VARCHAR(40) NOT NULL,
                slug VARCHAR(50),
                createdAt DATE
            );
        `;

        await this.query(query);
    }*/

    // create the giveaway members table
    /*async createMembersTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS giveaway_members (
                id SERIAL PRIMARY KEY,
                memberId VARCHAR(255) NOT NULL,
                win BOOLEAN DEFAULT false,
                winDate TIMESTAMP,
                giveawayId INTEGER NOT NULL,
                FOREIGN KEY (giveawayId) REFERENCES Giveaways(id) ON DELETE CASCADE
            );
        `;

        await this.query(query);
    }*/

    async end() {
        await this.pool.end();
    }
}

module.exports = PG4Discord;