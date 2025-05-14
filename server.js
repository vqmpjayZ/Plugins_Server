const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const plugins = {};

app.post('/api/plugin', express.json(), (req, res) => {
  const { name, author, code, icon, description, sections, bypasses } = req.body;
  
  if (!name || !author || !code) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  plugins[code.toUpperCase()] = {
    name,
    author,
    code: code.toUpperCase(),
    icon: icon || 11432864817,
    description: description || 'A custom bypass plugin',
    sections: sections || ['Common', 'Insults', 'Other'],
    bypasses: bypasses || []
  };
  
  res.json({ success: true, code: code.toUpperCase() });
});

app.get('/api/plugin', (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter' });
  }
  
  const plugin = plugins[code.toUpperCase()];
  
  if (!plugin) {
    return res.status(404).json({ error: 'Plugin not found' });
  }
  
  res.json(plugin);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
