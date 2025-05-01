const express = require('express');
const Learnosity = require('learnosity-sdk-nodejs');
const app = express();
const path = require('path');

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Set up view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Route for the home page
app.get('/', (req, res) => {
  res.render('index', {
    scripts: '<script src="/js/global.js"></script><script src="/js/learnosity-grading.js"></script>'
  });
});

// API endpoint to generate signed request
app.post('/api/init', (req, res) => {
  try {
    const { consumerKey, consumerSecret, userId, sessionId, items } = req.body;
    
    // Create assessment config
    const assessmentConfig = {
      user_id: userId,
      session_id: sessionId,
      activity_id: "Demo Activity",
      rendering_type: "inline",
      type: "submit_practice",
      name: "Demo",
      config: {
        regions: "main",
      },
      items: items || ["MANGA-DEMO-1","MANGA-DEMO-2","MANGA-DEMO-4","MANGA-DEMO-5"]
    };
    
    // Instantiate the SDK
    const learnositySdk = new Learnosity();
    
    // Generate the signed request
    const signedRequest = learnositySdk.init(
      'items',
      {
        consumer_key: consumerKey,
        domain: req.hostname || 'localhost',
      },
      consumerSecret,
      assessmentConfig
    );
    
    // Return the signed request to the client
    res.json({ success: true, signedRequest });
  } catch (error) {
    console.error('Error generating signed request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
