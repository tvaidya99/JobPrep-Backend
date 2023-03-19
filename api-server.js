const express = require('express');
const templates = require('./data/templates.json');
const app = express();

/*
Only for dev purposes
*/
const cors = require('cors');
const corsOptions = {
  origin: '*',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type']
}
app.use(cors(corsOptions));

// ATS friendly resume templates endpoint
app.get('/templates', (req, res) => {
  try {
    // Retrieve ATS friendly resume templates from database or external source
    const atsFriendlyResumeTemplates = templates['resume-templates'];

    // Retrieve cover letter helpers from database or external source
    const coverLetterHelpers = templates['cover-letter-templates'];

    // Return ATS friendly resume templates as JSON response
    res.json(
      [{ heading: 'ATS Friendly Resume Templates', resources: atsFriendlyResumeTemplates },
      { heading: 'ATS Friendly Cover Letter Templates', resources: coverLetterHelpers }]);
  } catch (err) {
    res.status(500);
  }
});

// Start the server
app.listen(8090, () => {
  console.log('API is running on port 8090');
});

// Specification for the API server

// To retrive data use the following endpoints:
// GET /ats-friendly-resume-templates
// GET /cover-letter-helpers

// The API server should return the following JSON response:
// {
//   "heading": "Cover Letter Templates",
//   "resources": [
//     {
//       "name": "How to Write a Cover Letter",
//       "url": "https://example.com/help-articles/how-to-write-a-cover-letter"
//     },
//     {
//       "name": "Cover Letter Template",
//       "url": "https://example.com/cover-letter-templates/cover-letter"
//     },
//     {
//       "name": "Cover Letter Examples",
//       "url": "https://example.com/cover-letter-examples"
//     }
//   ]
// }
