const Gang = require('../models/gang.js');

describe('Gang class', () => {
  let gang;
  const channelId = '1215647633633316894';

 /* beforeEach(() => {
    gang = new Gang(channelId);
  });*/

  test('should initialize with empty properties', () => {
    gang = new Gang(channelId);
    expect(gang.channelId).toBe(channelId);
    expect(gang.$id).not.toBeNull();
    expect(gang.name).toBe('');
    expect(gang.summary).toBe('');
    expect(gang.now).toBe('');
    expect(gang.leaderId).toBe('');
    expect(gang.members).toEqual([]);
  });

  test('should sync data with appwrite', async () => {
    gang = new Gang(channelId);
    await gang.create();
    gang.setName('My precious gang');
    gang.defineMC('328932220830220289');
    gang.setSummary('Summary of the gang');
    gang.setNow('Now is 10h');
    await gang.save();          
  });

  test('should retrieve data with id and update', async () => {
    const documentId = '43f0ecdf40354a9f9d1cf82744da498e';    
    gang = new Gang(channelId);
    await gang.retrieve(documentId);
    await gang.update(gang.channelId, 'My precious gang updated', gang.leaderId, gang.members, "still on the edge", "Now is 11h");
    // console.log(gang);
  });

  /*
  test('should fail to get document', () => {
    const id = 'testId';
    gang.sync(id);
    expect(gang.id).toBe(id);
  });

  test('should initialize with given id', () => {
    const id = '65eb8a9849a5bf22f759';
    gang.sync(id);
    expect(gang.id).toBe(id);
  });*/

});