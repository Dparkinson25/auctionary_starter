const leoProfanity = require('leo-profanity');


leoProfanity.loadDictionary();

// Function to check if text contains profanity
function containsProfanity(text = '') {
  try {
    return leoProfanity.check(String(text));
  } catch (e) {
    return false;
  }
}

function clean(text = '') {
  try {
    return leoProfanity.clean(String(text));
  } catch (e) {
    return String(text);
  }
}

module.exports = { containsProfanity, clean, leoProfanity };
