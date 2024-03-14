const Giveaway = require('../models/giveaway.js');

describe('Giveaway class', () => {
  let giveaway;
  const guildId = '1205061903601369118';

 /* beforeEach(() => {
    giveaway = new Giveaway(guildId);
  });*/

  test('should create a giveway', () => {
    giveaway = new Giveway(guildId, slug, summary = '');
    expect(giveaway.guildId).toBe(guildId);
    expect(giveaway.$id).not.toBeNull();
    expect(giveaway.slug).toBe(slug);
    expect(giveaway.summary).toBe('');
  });
  /*
  test('should sync data with appwrite', async () => {
    giveaway = new Giveaway(guildId);
    await giveaway.create();
    giveaway.setName('My precious giveaway');
    giveaway.defineMC('328932220830220289');
    giveaway.setSummary('Summary of the giveaway');
    giveaway.setNow('Now is 10h');
    await giveaway.save();          
  });

  test('should retrieve data with id and update', async () => {
    const documentId = '43f0ecdf40354a9f9d1cf82744da498e';    
    giveaway = new Giveaway(guildId);
    await giveaway.retrieve(documentId);
    await giveaway.update(giveaway.guildId, 'My precious giveaway updated', giveaway.leaderId, giveaway.members, "still on the edge", "Now is 11h");
    // console.log(giveaway);
  });

  /*
  test('should fail to get document', () => {
    const id = 'testId';
    giveaway.sync(id);
    expect(giveaway.id).toBe(id);
  });

  test('should initialize with given id', () => {
    const id = '65eb8a9849a5bf22f759';
    giveaway.sync(id);
    expect(giveaway.id).toBe(id);
  });*/

});