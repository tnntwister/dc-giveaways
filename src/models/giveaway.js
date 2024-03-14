const appWriteConfig = require('../config/appwrite.js');
const { generateDocumentId, generateMemberId } = require('../helpers/ids');
const sdk = require('node-appwrite');
const { AppwriteException } = require('node-appwrite');
const appWriteClient = new sdk.Client();
const databases = new sdk.Databases(appWriteClient);

appWriteClient
.setEndpoint(appWriteConfig.endpoint) 
.setProject(appWriteConfig.projectId)
.setKey(appWriteConfig.apiKey);


class Giveaway {
    constructor(guildId, id = null) {
       this.guildId = guildId;
       this.$id = null;
       this.slug = '';
       this.summary = '';
       this.now = '';
       this.winnerId = '';
       this.members = [];

      // if id is null, it means the giveaway is not yet created
      if (id === null) {
        this.$id = generateDocumentId();      
      } 
      this.create()
    }
    
    async create(guildId, slug, summary  = '') {
        if (this.$id === null) {
            throw new Error('ID is null');
        }
        const newGiveaway = {
            guildId: this.guildId,
            slug: this.slug,
            summary: this.summary,
            now: this.now,
            lastWinner: this.winnerId,
            members: this.members
        };
        
        try {
          const promise = await databases.createDocument(appWriteConfig.databaseId, appWriteConfig.giveawayCollection, this.$id, newGiveaway);
          return promise.$id;

        } catch (error) {
          if (error instanceof AppwriteException && error.message === 'Document with the requested ID could not be found.') {
            // Gérez l'erreur ici
          } else {
            throw error;
          }
        }
    }

    async retrieve(id) {
        try {
          const giveaway = await databases.getDocument(appWriteConfig.databaseId, appWriteConfig.giveawayCollection, id);
          this.$id = giveaway.$id;
          this.guildId = giveaway.guildId;
          this.slug = giveaway.slug;
          this.summary = giveaway.summary;
          this.now = giveaway.now;
          this.lastWinner = giveaway.winner;
          this.members = giveaway.members;
        } catch (error) {
          if (error instanceof AppwriteException && error.message === 'Document with the requested ID could not be found.') {
            // Gérez l'erreur ici
          } else {
            throw error;
          }
        }
      }

    async save() {
        const updatedGiveaway = {
          guildId: this.guildId,
          slug: this.slug,
          summary: this.summary,
          now: this.now,
          winner: this.lastWinner,
          members: this.members
        };
        try {
          return await databases.updateDocument(appWriteConfig.databaseId, appWriteConfig.giveawayCollection, this.$id, updatedGiveaway);
        } catch (error) {
          if (error instanceof AppwriteException && error.message === 'Document with the requested ID could not be found.') {
            // Gérez l'erreur ici
          } else {
            throw error;
          }
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
          winner: this.lastWinner,
          members: this.members
        };

        try {
          return await databases.updateDocument(appWriteConfig.databaseId, appWriteConfig.giveawayCollection, this.$id, updatedGiveaway);
        } catch (error) {
          if (error instanceof AppwriteException && error.message === 'Document with the requested ID could not be found.') {
            // Gérez l'erreur ici
          } else {
            throw error;
          }
        }
      }
  
    addPC(memberId) {
      this.members.push(memberId);
    }

    defineMC(memberId) {
        if (!this.members.includes(memberId)) {
            this.members.push(memberId);
        }
        this.lastWinner = memberId;
    }   
  
    removeMember(memberId) {      
      this.members = this.members.filter(id => id !== memberId);
      // if the member was the winner, the first member in the list becomes the winner
        if (this.lastWinner === memberId) {
            this.lastWinner = this.members[0];
        }
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
    constructor(givewayId, memberId, save = true) {
      this.memberId = memberId;
      this.win = false;
      this.winDate = null;
      this.giveawayId = givewayId;

      // try to retrieve the member from the database
      if (save)
        this.retrieve();

    }

    /**
     * 
     * @param {*} giveawayId 
     * @param {*} memberId 
     * @returns 
     */
    async create(giveawayId, memberId) {
      const newMember = {
        memberId: memberId,
        win: 0,
        winDate: null,
        giveawayId: giveawayId
      };
      try {
        await databases.createDocument(appWriteConfig.databaseId, appWriteConfig.giveawayMemberCollection, generateMemberId(), newMember);
      } catch (error) {
        if (error instanceof AppwriteException) {
          // throw an error with the AppwriteException message
          throw new Error(error.message);
        } else {
          throw error;
        }
      }
    }

    async retrieve() {
      let filters = [
        'memberId=='+ this.memberId,
        'giveawayId==' + this.giveawayId
      ];

      try {
        const member = await databases.listDocuments(appWriteConfig.databaseId, appWriteConfig.giveawayMemberCollection, filters);
        if (member.$id !== null) {
          this.memberId = member.memberId;
          this.win = member.win;
          this.winDate = member.winDate;
          this.giveawayId = member.giveawayId;
        } else {
          this.create(this.giveawayId, this.memberId);
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
        return await databases.updateDocument(appWriteConfig.databaseId, appWriteConfig.giveawayMemberCollection, memberDocumentId, updatedMember);
      } catch (error) {
        if (error instanceof AppwriteException && error.message === 'Document with the requested ID could not be found.') {
          // Gérez l'erreur ici
        } else {
          throw error;
        }
      }
    }
  }

  module.exports = Giveaway;
