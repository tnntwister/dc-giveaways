const appWriteConfig = require('../config/appwrite.js');
const sdk = require('node-appwrite');
const appWriteClient = new sdk.Client();
const databases = new sdk.Databases(appWriteClient);

appWriteClient
.setEndpoint(appWriteConfig.endpoint) 
.setProject(appWriteConfig.projectId)
.setKey(appWriteConfig.apiKey) 
;


class Gang {
    constructor(channelId, id = null) {
       this.channelId = channelId;
       this.id = null;
       this.name = '';
       this.summary = '';
       this.now = '';
       this.leaderId = '';
       this.members = [];

      // if id is null, it means the gang is not yet created
      
      if (id !== null) {
        this.id = id;
        this.sync(id);
      } else {
        const promise = databases.createDocument(appWriteConfig.databaseId, appWriteConfig.gangCollection, unique(), {
            channelId: this.channelId,
        });

        promise.then(function (response) {
            console.log(response);
        }, function (error) {
            console.log(error);
        });
      }
    }

    async sync(id) {
        // Requête de type "list" sur la collection
        const gang = await databases.getDocument("gangs", id);
        /*.then(response => {
            // Le premier document de la réponse contient l'ID le plus élevé
            const highestId = response.documents[0].$id;
            console.log(`L'ID le plus élevé de la collection "${collectionName}" est : ${highestId}`);
            // On incrémente cet ID pour obtenir le prochain ID
            this.id = highestId + 1;
        })
        .catch(error => {
            throw new Error(`Erreur lors de la récupération de l'ID le plus élevé de la collection "${collectionName}" : ${error}`);
        });*/
        console.log(gang);
    }


    update(channelId, name, leaderId, members = [], summary  = '', now = '') {
        this.channelId = channelId;
        this.name = this.setName(name);
        this.summary = this.setSummary(summary);
        this.now = this.setNow(now);
        this.leaderId = this.defineMC(leaderId);
        this.members = members.forEach(memberId => this.addPC(memberId));
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