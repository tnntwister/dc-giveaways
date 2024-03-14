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
    constructor(guildId, slug, summary  = '') {
       this.guildId = guildId;
       this.$id = null;
       this.slug = '';
       this.summary = '';
       this.now = '';
       this.winnerId = '';
       this.members = [];

      // on essaie de récupérer le giveaway depuis la base de données
      this.retrieve(guildId, slug, summary);      
    }
    
    async create(guildId, slug, summary  = '') {
        if (this.$id === null) {
            throw new Error('ID is null');
        }

        this.guildId = guildId;
        this.slug = slug;
        this.summary = summary;
        
        const newGiveaway = {
            guildId: guildId,
            slug: slug,
            summary: summary
        };
        
        try {
          console.log('create', appWriteConfig.databaseId, appWriteConfig.giveawayCollection, newGiveaway);
          const promise = await databases.createDocument(
            appWriteConfig.databaseId, 
            appWriteConfig.giveawayCollection, 
            generateDocumentId(), 
            newGiveaway
          );
          return promise.$id;

        } catch (error) {
          if (error instanceof AppwriteException) {
            // throw an error with the AppwriteException message
            throw new Error(error.message);
          } else {
            throw error;
          }
        }
    }

    async retrieve(guildId, slug, summary) {
      console.log('retrieve', appWriteConfig.databaseId, appWriteConfig.giveawayCollection, id);
      const filters = [
        'guildId==' + guildId,
        'slug==' + slug 
      ];

        try {
          const giveaways = await databases.listDocuments(appWriteConfig.databaseId, appWriteConfig.giveawayCollection, filters);
          if (giveaways.total > 0) {
            this.$id = giveaways.documents[0].$id;
            this.guildId = giveaways.documents[0].guildId;
            this.slug = giveaways.documents[0].slug;
            this.summary = giveaways.documents[0].summary;
            this.now = giveaways.documents[0].now;
            this.lastWinner = giveaways.documents[0].winner
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

    async save() {
        const updatedGiveaway = {
          guildId: this.guildId,
          slug: this.slug,
          summary: this.summary,
          now: this.now,
          winner: this.lastWinner
        };
        try {
          return await databases.updateDocument(appWriteConfig.databaseId, appWriteConfig.giveawayCollection, this.$id, updatedGiveaway);
        } catch (error) {
          if (error instanceof AppwriteException) {
            // throw an error with the AppwriteException message
            throw new Error(error.message);
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
          if (error instanceof AppwriteException) {
            // throw an error with the AppwriteException message
            throw new Error(error.message);
          } else {
            throw error;
          }
        }
      }
  
    async retrieveMembers(db = true) {
      // return the list of members from appwrite
      if (db) {
        const membersList = await databases.listDocuments(appWriteConfig.databaseId, appWriteConfig.giveawayMemberCollection, ['giveawayId==' + this.$id]);
        if (membersList.total === 0) {
          this.members = membersList.documents;
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
      for (let i = 0; i < memberList.length; i++) {
        members.push({
          giveawayId: this.$id,
          memberId: memberList[i],
        });
      }
      await databases.createDocuments(appWriteConfig.databaseId, appWriteConfig.giveawayMemberCollection, members);
    }

    async pickWinner() {  
      const members = await this.retrieveMembers();
      const membersId = members.map(member => member.memberId);
      // pick a random winner
      const winnerId = membersId[Math.floor(Math.random() * membersId.length)];

      // write information in the database
      const member = new GiveawayMember(this.$id, winnerId);
      member.setWin(members.find(member => member.memberId === winnerId).$id);

      // save information in giveaway
      this.lastWinner = winnerId;
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
      this.giveawayId = giveawayId;
      this.memberId = memberId;

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
