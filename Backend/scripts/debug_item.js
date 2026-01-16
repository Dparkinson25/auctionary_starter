(async () => {
  const fs = require('fs');
  const path = require('path');
  const goodUsers = JSON.parse(fs.readFileSync(path.join(__dirname, '..','tests','data','good_user_data.json')));
  const goodItems = JSON.parse(fs.readFileSync(path.join(__dirname, '..','tests','data','good_item_data.json')));
  const loginBody = { email: goodUsers[0].email, password: goodUsers[0].password };
  try {
    const loginRes = await fetch('http://localhost:3333/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginBody)
    });
    const loginJson = await loginRes.json();
    console.log('LOGIN STATUS', loginRes.status, loginJson);
    const token = loginJson.session_token;
    const item = goodItems[0];
    const itemBody = { name: item.name, description: item.description, starting_bid: item.starting_bid, end_date: item.end_date };
    const createRes = await fetch('http://localhost:3333/item', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Authorization': token }, body: JSON.stringify(itemBody)
    });
    let text;
    try { text = await createRes.text(); text = JSON.parse(text); } catch(e) { text = await createRes.text(); }
    console.log('CREATE STATUS', createRes.status, text);
  } catch (e) {
    console.error('ERROR', e);
  }
})();