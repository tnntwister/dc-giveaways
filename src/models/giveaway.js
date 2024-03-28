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
       this.createdAt = new Date();
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
    }

    async retrieve() {
        try {
          const result = await pool.query("SELECT * FROM giveaways WHERE \"guildId\" = $1 AND slug = $2", [this.guildId.toString(), this.slug]);
          if (result.rows.length > 0) {
            const giveaway = result.rows[0];
            this.id = giveaway.id;
            this.guildId = giveaway.guildId;
            this.slug = giveaway.slug;
            this.summary = giveaway.summary;
            this.now = giveaway.now;
            this.winnerId = giveaway.winnerId;
            this.createdAt = giveaway.createdAt;
          } else {
            const document = await this.create();
            this.id = document.id;
            this.guildId = document.guildId;
            this.slug = document.slug;
            this.summary = document.summary;
            this.now = document.now;
            this.winnerId = document.winnerId;
            this.createdAt = document.createdAt;
          }
          return this;
        } catch (error) {
          throw error;
        }
      }

    async save() {
        try {
          const result = await pool.query("UPDATE giveaways SET \"guildId\" = $1, slug = $2, summary = $3, now = $4, \"lastWinner\" = $5 WHERE id = $6 RETURNING *", [this.guildId, this.slug, this.summary, this.now, this.winnerId, this.id]);
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
        const result = await pool.query("SELECT * FROM giveaway_members WHERE \"giveawayId\" = $1", [this.id]);
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
      // if giveawayId is not set, throw an error
      if (!this.id) {
        throw new Error('Impossible d\'ajouter des membres à un giveaway sans id.');
      }
      return GiveawayMember.bulkCreate(memberList, this.id);        
    }

    // remove all members from the giveaway
    async removeMembers(membersSelection = null) {
      let membersId = [];
      let members = [];

      if (membersSelection === null) {
        members = await this.retrieveMembers();
        if (members.length === 0) {
          return;
        }    
      } else {
        members = membersSelection;
      }

      membersId = members
        .filter(member => member.giveawayId === this.id)
        .map(member => member.id);  

      // format membersId to be used in the query
      await pool.query("DELETE FROM giveaway_members WHERE id IN " + '(' + membersId.join(', ') + ')');
    }

    async pickWinner() {  
      const members = await this.retrieveMembers();
      if (members.length === 0) {
        throw new GiveawayMemberNotFoundError();
      }

      // if all members are winners, set all members to false
      if (members.every(member => member.win === true)) {
        await pool.query("UPDATE giveaway_members SET win = false, \"winDate\" = NULL WHERE \"giveawayId\" = $1", [this.id]);
      }

      // pick a random winner
      const pretenders = members.filter(member => member.win === false);
      const winner = pretenders[Math.floor(Math.random() * pretenders.length)];
      

      // write information in the database
      const member = new GiveawayMember(this.id, winner.memberId);            
      await member.retrieve();
      member.setWin(member.id);

      // save information in giveaway
      this.winnerId = member.memberId;
      this.setNow('Le gagnant est u' + this.winnerId + 'u ! Félicitations à lui/elle !');
      this.save();

      return this.winnerId;
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
      this.id = null;
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

    // bulk insert members
    static async bulkCreate(members, giveawayId) {
      // throw an error if members is not an array
      if (!Array.isArray(members) || members.length === 0) {
        throw new Error('members must be an array');
      }
      const newMembers = members.map(member => {
        return {
          memberId: member,
          win: false,
          winDate: null,
          giveawayId: giveawayId
        };
      });
      const values = newMembers.map(member => {
        const winDate = member.winDate == 'null' ? `'${member.winDate}'` : null;
        return `('${member.memberId}', ${member.win}, ${winDate}, ${member.giveawayId})`;
      }).join(', ');
      const query = `INSERT INTO giveaway_members ("memberId", win, "winDate", "giveawayId") VALUES ${values}  ON CONFLICT DO NOTHING RETURNING *`;
      // console.log('query', query);
      try {
        const result = await pool.query(query);
        return result.rows;
      }
      catch (error) {
        throw error;
      }
    }

    async retrieve() {
      try {
        const result = await pool.query("SELECT * FROM giveaway_members WHERE \"memberId\" = $1 AND \"giveawayId\" = $2", [this.memberId, this.giveawayId]);
        if (result.rows.length > 0) {
          this.id = result.rows[0].id;
          this.memberId = result.rows[0].memberId;
          this.win = result.rows[0].win;
          this.winDate = result.rows[0].winDate;
          this.giveawayId = result.rows[0].giveawayId;
        } else {
          await this.create(this.giveawayId, this.memberId);
        }
      } catch (error) {
        if (error.message != undefined && error.message != '') {
          // throw an error with the AppwriteException message
          throw new Error(error.message);
        } else {
          throw error;
        }
      }
    }

    /**
     * 
     * @param {*} memberId 
     * @returns 
     */  
    async setWin(memberId) {
      this.win = true;
      this.winDate = new Date();
      this.winDate = this.winDate.toISOString();

      try {
        const result = await pool.query("UPDATE giveaway_members SET win = $1, \"winDate\" = $2 WHERE id = $3 RETURNING *", [this.win, this.winDate, memberId]);
        return result.rows[0];
      } catch (error) {
        throw error;
      }
    }
  }

  module.exports = Giveaway;  
  module.exports.GiveawayMember = GiveawayMember;
  module.exports.GiveawayMemberNotFoundError = GiveawayMemberNotFoundError;
