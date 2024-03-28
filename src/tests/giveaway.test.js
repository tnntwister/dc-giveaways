const Giveaway = require('../models/giveaway.js');
const { GiveawayMember } = require('../models/giveaway.js');
const { generateMemberId } = require('../helpers/ids');

beforeAll(() => {
  guildId = '1205061903601369118';
  giveaway = giveaway = new Giveaway(guildId, "premier-giveway", 'Mon premier giveway');
});

describe('Giveaway class', () => {
  test('should create a giveway', async () => {
    await giveaway.retrieve();      
    expect(giveaway.guildId).toBe(guildId);
    expect(giveaway.$id).not.toBeNull();
    expect(giveaway.slug).toBe("premier-giveway");
  });

  test('should update a giveway', async () => {
    await giveaway.retrieve();    

    // on change les valeurs
    giveaway.setSummary('Mon premier giveway updated');
    giveaway.setNow('Now is 10h');
    await giveaway.save();

    expect(giveaway.slug).toBe("premier-giveway");
    expect(giveaway.summary).toBe('Mon premier giveway updated');
    expect(giveaway.now).toBe('Now is 10h');
  }); 


  test('should add members to the giveaway', async () => {
    await giveaway.retrieve();

    const memberList = [];
    for (let i = 0; i < 10; i++) {
     memberList.push(generateMemberId());
    }
    
    await giveaway.addMembers(memberList);
    const members = await giveaway.retrieveMembers();
    expect(members.length).toBeGreaterThanOrEqual(8);
  }); 

  test('should remove members from the giveaway', async () => {
    let members = await giveaway.retrieveMembers();
    expect(members.length).toBeGreaterThanOrEqual(8);
    const membersToRemove = members.slice(8); // select all members after the 8th
    await giveaway.removeMembers(membersToRemove);
    members = await giveaway.retrieveMembers();
    expect(members.length).toBe(8);
  });

  test('should draw a winner', async () => {
    await giveaway.retrieve();
    const winnerId = await giveaway.pickWinner();
    expect(winnerId).not.toBeNull();
    let winner = new GiveawayMember(giveaway.id, winnerId);
    await winner.retrieve();
    expect(winner.memberId).toBe(winnerId);
    expect(winner.winDate).not.toBeNull();
  });
    
  afterAll(async () => {
    await giveaway.removeMembers();
    await giveaway.destroy();
  });

});