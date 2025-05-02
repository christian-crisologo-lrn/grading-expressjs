const express = require('express');
const Learnosity = require('learnosity-sdk-nodejs');
const app = express();
const path = require('path');
const { engine } = require('express-handlebars'); // ✅ use destructuring
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static('public'));


// Set up Handlebars engine
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));


// Route for the home page
app.get('/', (req, res) => {
  // Pass environment variables to the client
  const clientConfig = {
    consumerKey: process.env.LEARNOSITY_CONSUMER_KEY,
    consumerSecret: process.env.LEARNOSITY_CONSUMER_SECRET,
    graderId: process.env.LEARNOSITY_GRADER_ID,
    gradeSessionId: process.env.LEARNOSITY_GRADE_SESSION_ID,
    items: (process.env.LEARNOSITY_ITEMS || '').split(','),
    studentId: process.env.LEARNOSITY_STUDENT_ID,
    assessSessionId: process.env.LEARNOSITY_ASSESS_SESSION_ID,
  };
  
  res.render('index', {
    scripts: '<script src="/js/global.js"></script><script src="/js/learnosity-grading.js"></script>',
    config: JSON.stringify(clientConfig)
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
      }
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
