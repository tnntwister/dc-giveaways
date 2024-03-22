const Giveaway = require('../models/giveaway.js');
const { generateDocumentId, generateMemberId } = require('../helpers/ids');

describe('Giveaway class', () => {
  let giveaway;
  const guildId = '1205061903601369118';

 /* beforeEach(() => {
    giveaway = new Giveaway(guildId);
  });*/

  test('should create a giveway', async () => {
    giveaway = new Giveaway(guildId, "premier-giveway", 'Mon premier giveway');
    await giveaway.retrieve();      
    expect(giveaway.guildId).toBe(guildId);
    expect(giveaway.$id).not.toBeNull();
    expect(giveaway.slug).toBe("premier-giveway");
    expect(giveaway.summary).toBe('Mon premier giveway');    
    await giveaway.destroy();
  });
/*
  test('should update a giveway', async () => {
    giveaway = new Giveaway(guildId, "premier-giveway", 'Mon premier giveway');
    await giveaway.retrieve();    

    // on change les valeurs
    giveaway.setSummary('Mon premier giveway updated');
    giveaway.setNow('Now is 10h');
    await giveaway.save();

    expect(giveaway.slug).toBe("premier-giveway");
    expect(giveaway.summary).toBe('Mon premier giveway updated');
    expect(giveaway.now).toBe('Now is 10h');
    await giveaway.destroy();
  });  */

  /*test('should delete members from one giveaway', async () => {
    giveaway = new Giveaway(guildId, "premier-giveway", 'Mon premier giveway');
    await giveaway.retrieve();

    // Assuming you have a method to retrieve members
    const members = await giveaway.retrieveMembers();
    expect(members.length).toBeGreaterThanOrEqual(8);
    console.log(members);
    // await giveaway.removeMembers();
  });*/

  /*
  test('should add members to the giveaway', async () => {
    giveaway = new Giveaway(guildId, "premier-giveway", 'Mon premier giveway');
    await giveaway.retrieve();

    const memberList = [];
    // generate 10 members
    for (let i = 0; i < 10; i++) {
      memberList.push(generateMemberId());
    }
    
    await giveaway.addMembers(memberList);
    // Assuming you have a method to retrieve members
    const members = await giveaway.retrieveMembers();
    new Promise(resolve => setTimeout(resolve, 1000));
    console.log("add members", giveaway.$id, members);
    expect(members.length).toBeGreaterThanOrEqual(8);
    await giveaway.removeMembers();
    await giveaway.destroy();
  }); */
  

});