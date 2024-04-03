const { v4: uuidv4 } = require('uuid');


function generateDocumentId() {
    let id = uuidv4().replace(/-/g, '').substring(0, 36);

    // Assurez-vous que l'ID ne commence pas par un caractère spécial
    if (!/^[a-zA-Z0-9]/.test(id)) {
      id = 'a' + id.substring(1);
    }
  
    return id;
}
// generate 18 digit id
function generateMemberId() {
    let id = uuidv4().replace(/-/g, '').substring(0, 18);

    // Assurez-vous que l'ID ne commence pas par un caractère spécial
    if (!/^[a-zA-Z0-9]/.test(id)) {
      id = 'a' + id.substring(1);
    }
  
    return id;    
}

// generate 18 digit id
function memberProfile(member) {
  return ` <@${member.id}> (${member.displayName}) `;    
}




/*
function anotherHelperFunction() {
// Votre code ici
}*/

module.exports = {
    generateDocumentId,
    generateMemberId,
    memberProfile
  };