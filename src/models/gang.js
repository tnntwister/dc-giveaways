const appWriteConfig = require('../config/appwrite.js');
const { generateDocumentId } = require('../helpers/ids');
const sdk = require('node-appwrite');
const { AppwriteException } = require('node-appwrite');
const appWriteClient = new sdk.Client();
const databases = new sdk.Databases(appWriteClient);

appWriteClient
.setEndpoint(appWriteConfig.endpoint) 
.setProject(appWriteConfig.projectId)
.setKey(appWriteConfig.apiKey);


class Gang {
    constructor(channelId, id = null) {
       this.channelId = channelId;
       this.$id = null;
       this.name = '';
       this.summary = '';
       this.now = '';
       this.leaderId = '';
       this.members = [];

      // if id is null, it means the gang is not yet created
      if (id === null) {
        this.$id = generateDocumentId();      
      } 
    }
    
    async create() {
        if (this.$id === null) {
            throw new Error('ID is null');
        }
        const newGang = {
            channelId: this.channelId,
            name: this.name,
            summary: this.summary,
            now: this.now,
            leader: this.leaderId,
            members: this.members
        };
        
        try {
          const promise = await databases.createDocument(appWriteConfig.databaseId, appWriteConfig.gangCollection, this.$id, newGang);
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
          const gang = await databases.getDocument(appWriteConfig.databaseId, appWriteConfig.gangCollection, id);
          this.$id = gang.$id;
          this.channelId = gang.channelId;
          this.name = gang.name;
          this.summary = gang.summary;
          this.now = gang.now;
          this.leaderId = gang.leader;
          this.members = gang.members;
        } catch (error) {
          if (error instanceof AppwriteException && error.message === 'Document with the requested ID could not be found.') {
            // Gérez l'erreur ici
          } else {
            throw error;
          }
        }
      }

    async save() {
        const updatedGang = {
          channelId: this.channelId,
          name: this.name,
          summary: this.summary,
          now: this.now,
          leader: this.leaderId,
          members: this.members
        };
        try {
          return await databases.updateDocument(appWriteConfig.databaseId, appWriteConfig.gangCollection, this.$id, updatedGang);
        } catch (error) {
          if (error instanceof AppwriteException && error.message === 'Document with the requested ID could not be found.') {
            // Gérez l'erreur ici
          } else {
            throw error;
          }
        }
      }
  

    async update(channelId, name, leaderId, members = [], summary  = '', now = '') {
        
        this.channelId = channelId;
        this.setName(name);
        this.setSummary(summary);
        this.setNow(now);
        this.members = members.forEach(memberId => this.addPC(memberId));
        if(Array.isArray(this.members) && this.members.length > 0) {
          this.defineMC(leaderId);
        }  

        
        const updatedGang = {
          channelId: this.channelId,
          name: this.name,
          summary: this.summary,
          now: this.now,
          leader: this.leaderId,
          members: this.members
        };

        try {
          return await databases.updateDocument(appWriteConfig.databaseId, appWriteConfig.gangCollection, this.$id, updatedGang);
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
        this.leaderId = memberId;
    }   
  
    removeMember(memberId) {      
      this.members = this.members.filter(id => id !== memberId);
      // if the member was the leader, the first member in the list becomes the leader
        if (this.leaderId === memberId) {
            this.leaderId = this.members[0];
        }
    }

    setName(name) {
      this.name = name;
    }
  
    getName() {
      return this.name;
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

  module.exports = Gang;
