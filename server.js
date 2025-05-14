const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, 'plugins.json');

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}));
}

function loadPlugins() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading plugins:', error);
    return {};
  }
}

function savePlugins(plugins) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(plugins, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving plugins:', error);
    return false;
  }
}

app.get('/plugin/:code', (req, res) => {
  const { code } = req.params;
  const plugins = loadPlugins();
  
  if (plugins[code]) {
    res.json(plugins[code]);
  } else {
    res.status(404).json({ error: 'Plugin not found' });
  }
});

app.post('/plugin/create', (req, res) => {
  const pluginData = req.body;
  const plugins = loadPlugins();
  
  if (!pluginData.name || !pluginData.code || !pluginData.bypasses || pluginData.bypasses.length === 0) {
    return res.status(400).json({ 
      success: false,
      error: 'Missing required fields' 
    });
  }

  if (plugins[pluginData.code]) {
    let newCode = pluginData.code;
    while (plugins[newCode]) {
      if (newCode.length < 6) {
        newCode = generateRandomCode(newCode.length + 1);
      } else {
        newCode = generateRandomCode(6);
      }
    }
    pluginData.code = newCode;
  }

  plugins[pluginData.code] = pluginData;
  if (savePlugins(plugins)) {
    res.json({ 
      success: true,
      code: pluginData.code 
    });
  } else {
    res.status(500).json({ 
      success: false,
      error: 'Failed to save plugin' 
    });
  }
});

function generateRandomCode(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
