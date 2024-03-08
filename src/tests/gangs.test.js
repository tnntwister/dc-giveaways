const Gangs = require('../models/gangs.js');

describe('Gangs class', () => {
  let gangs;

  beforeEach(() => {
    gangs = new Gangs();
  });

  test('should initialize with empty properties', () => {
    expect(gangs.summary).toBe('');
    expect(gangs.now).toBe('');
    expect(gangs.leaderId).toBe('');
    expect(gangs.members).toEqual([]);
  });

  // Ajoutez d'autres tests pour les autres méthodes de la classe
});