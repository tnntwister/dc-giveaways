const pgConfig = require('../config/pg.js');
const { Pool } = require('pg');
const { generateDocumentId, generateMemberId } = require('../helpers/ids');

const pool = new Pool({
  user: pgConfig.user,
  host: pgConfig.host,
  database: pgConfig.database,
  password: pgConfig.password,
  port: pgConfig.port
});

class Giveaway {
    constructor(guildId, slug, summary  = '') {
       this.guildId = guildId;
       this.id = null;
       this.slug = slug;
       this.summary = summary;
       this.now = '';
       this.winnerId = '';
       this.members = [];

      // on essaie de récupérer le giveaway depuis la base de données
      // return this.retrieve(guildId, slug, summary);      
    }
    
    async create() {
       
        const newGiveaway = {
            guildId: this.guildId,
            slug: this.slug,
            summary: this.summary
        };
        
        const result = await pool.query("INSERT INTO giveaways (\"guildId\", slug, summary) VALUES ($1, $2, $3) RETURNING *", [this.guildId, this.slug, this.summary]);
        return result.rows[0];
        /*try {
          const document = await databases.createDocument(
            appWriteConfig.databaseId, 
            appWriteConfig.giveawayCollection, 
            generateDocumentId(), 
            newGiveaway
          );
          return document;

        } catch (error) {
          if (error instanceof AppwriteException) {
            // throw an error with the AppwriteException message
            throw new Error(error.message);
          } else {
            throw error;
          }
        }*/

    }

    async retrieve() {
        try {
          const result = await pool.query("SELECT * FROM giveaways WHERE \"guildId\" = $1 AND slug = $2", [this.guildId.toString(), this.slug]);
          console.log(result);
          if (result.length > 0) {
            const giveaway = result[0];
            console.log(giveaway);

            this.id = giveaway.id;
            this.guildId = giveaway.guildId;
            this.slug = giveaway.slug;
            this.summary = giveaway.summary;
            this.now = giveaway.now;
            this.winnerId = giveaway.winnerId;
          } else {
            const document = await this.create();
            console.log(document);
            this.id = document.id;
            this.guildId = document.guildId;
            this.slug = document.slug;
            this.summary = document.summary;
            this.now = document.now;
            this.winnerId = document.winnerId;
          }
          return this;
        } catch (error) {
          throw error;
        }
      }

    async save() {
        const updatedGiveaway = {
          guildId: this.guildId,
          slug: this.slug,
          summary: this.summary,
          now: this.now,
          winner: this.winnerId
        };
        try {
          const result = await pool.query("UPDATE giveaways SET \"guildId\" = $1, slug = $2, summary = $3, now = $4, winnerId = $5, members = $6 WHERE id = $7 RETURNING *", [this.guildId, this.slug, this.summary, this.now, this.winnerId, this.members, this.id]);
          return result.rows[0];
        } catch (error) {
          throw error;
        }
      }
  

    async update(guildId, slug, lastWinner, members = [], summary  = '', now = '') {
        
        this.guildId = guildId;
        this.setName(slug);
        this.setSummary(summary);
        this.setNow(now);
        this.members = members.forEach(memberId => this.addPC(memberId));
        if(Array.isArray(this.members) && this.members.length > 0) {
          this.defineMC(lastWinner);
        }  

        
        const updatedGiveaway = {
          guildId: this.guildId,
          slug: this.slug,
          summary: this.summary,
          now: this.now,
          winner: this.winnerId,
          members: this.members
        };

        try {
          const result = await pool.query("UPDATE giveaways SET \"guildId\" = $1, slug = $2, summary = $3, now = $4, winnerId = $5, members = $6 WHERE id = $7 RETURNING *", [this.guildId, this.slug, this.summary, this.now, this.winnerId, this.members, this.id]);
          return result.rows[0];
        } catch (error) {
          throw error;
        }
      }

    async destroy() {
      try {
        const result = await pool.query("DELETE FROM giveaways WHERE id = $1", [this.id]);
        if (result.rowCount === 0) {
          throw new Error("Impossible de supprimer le giveaway, peut-être qu'il n'existe pas.");
        }
      } catch (error) {
        throw error;
      }
    }  
  
    async retrieveMembers(db = true) {
      // return the list of members from appwrite
      if (db) {
        const result = await pool.query("SELECT * FROM giveaway_members WHERE giveawayId = $1", [this.id]);
        if (result.rows.length > 0) {
          this.members = result.rows;
          return this.members;
        }        
      } else {
        return this.members;
      }      
    }

    /**
     * 
     * @param {*} memberList | Array of member ids
     */
    async addMembers(memberList) {
      const members = [];
      // if giveawayId is not set, throw an error
      if (!this.id) {
        throw new Error('Impossible d\'ajouter des membres à un giveaway sans id.');
      }
      for (let i = 0; i < memberList.length; i++) {
        let member = new GiveawayMember(this.id, memberList[i]);        
        members.push(member);
      }
      
    }

    // remove all members from the giveaway
    async removeMembers(membersSelection = null) {
      let membersId = [];
      if (membersSelection === null) {
        
        const members = await this.retrieveMembers();
        if (members.length === 0) {
          return;
        }
        // get the list of members id of the giveaway
        membersId = members
        .filter(member => member.giveawayId === this.id)
        .map(member => member.id);        
      } else {
        membersId = membersSelection;
      }
      for (const memberId of membersId) {
        await databases.deleteDocument(appWriteConfig.databaseId, appWriteConfig.membersCollection, memberId);
      }
    }

    async pickWinner() {  
      const members = await this.retrieveMembers();
      if (members.length === 0) {
        throw new GiveawayMemberNotFoundError();
      }
      const membersId = members.map(member => member.memberId);
      // pick a random winner
      const winnerId = membersId[Math.floor(Math.random() * membersId.length)];

      // write information in the database
      const member = new GiveawayMember(this.id, winnerId);
      member.setWin(members.find(member => member.memberId === winnerId).id);

      // save information in giveaway
      this.winnerId = winnerId;
      this.setNow('Le gagnant est ' + winnerId);
      this.save();

      return winnerId;
    }

    setName(slug) {
      this.slug = slug;
    }
  
    getName() {
      return this.slug;
    }
  
    setSummary(summary) {
      this.summary = summary;
    }
  
    getSummary() {
      return this.summary;
    }
  
    setNow(nowMessage) {
      this.now = nowMessage;
    }

    getNow() {
      return this.now;
    }  
  }

  class GiveawayMemberNotFoundError extends Error {
    constructor(message = "Ce membre pour ce giveaway n'a pas été trouvé.") {
      super(message); // Pass the message to the Error constructor
      this.name = 'GiveawayMemberNotFoundError'; // Set the name of the error
    }
  }

  class GiveawayMember {
    constructor(giveawayId, memberId, save = true) {
      this.memberId = memberId;
      this.win = false;
      this.winDate = null;
      this.giveawayId = giveawayId;

      // try to retrieve the member from the database
      if (save){
        this.retrieve();
      }
    }

    /**
     * 
     * @param {*} giveawayId 
     * @param {*} memberId 
     * @returns 
     */
    async create(giveawayId, memberId) {
      this.giveawayId = giveawayId;
      this.memberId = memberId;

      const newMember = {
        memberId: memberId,
        win: false,
        winDate: null,
        giveawayId: giveawayId
      };
      try {
        const result = await pool.query("INSERT INTO giveaway_members (\"memberId\", win, \"winDate\", \"giveawayId\") VALUES ($1, $2, $3, $4) RETURNING *", [newMember.memberId, newMember.win, newMember.winDate, newMember.giveawayId]);
        return result.rows[0];
      } catch (error) {
        throw error;
      }
    }

    async retrieve() {
      const filters = [
        Query.equal('memberId', this.memberId),
        Query.equal('giveawayId', this.giveawayId)
      ];
      try {
        const result = await pool.query("SELECT * FROM giveaway_members WHERE \"memberId\" = $1 AND \"giveawayId\" = $2", [this.memberId, this.giveawayId]);
        if (result.rows.length > 0) {
          this.memberId = result.rows[0].memberId;
          this.win = result.rows[0].win;
          this.winDate = result.rows[0].winDate;
          this.giveawayId = result.rows[0].giveawayId;
        } else {
          await this.create(this.giveawayId, this.memberId);
        }
      } catch (error) {
        if (error instanceof AppwriteException) {
          // throw an error with the AppwriteException message
          throw new Error(error.message);
        } else {
          throw error;
        }
      }
    }

    async setWin(memberDocumentId) {
      this.win = true;
      this.winDate = new Date();
      const updatedMember = {
        memberId: this.memberId,
        win: this.win,
        winDate: this.winDate,
        giveawayId: this.giveawayId
      };
      try {
        const result = await pool.query("UPDATE giveaway_members SET win = $1, winDate = $2 WHERE id = $3 RETURNING *", [this.win, this.winDate, memberDocumentId]);
        return result.rows[0];
      } catch (error) {
        throw error;
      }
    }
  }

  module.exports = Giveaway;
