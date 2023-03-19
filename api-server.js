const express = require('express');
const app = express();

// ATS friendly resume templates endpoint
app.get('/ats-friendly-resume-templates', (req, res) => {
  // Retrieve ATS friendly resume templates from database or external source
  const atsFriendlyResumeTemplates = [
    { name: 'OverLeaf', url: 'https://www.overleaf.com/gallery/tagged/cv' },
    { name: 'LaTex Templates', url: 'https://www.latextemplates.com/cat/curricula-vitae' },
    { name: 'Hiration', url: 'https://www.hiration.com/templates/' },
    { name: 'Novoresume', url: 'https://novoresume.com/resume-templates' },
    { name: 'Zety', url: 'https://zety.com/blog/best-resume-templates' },
    { name: 'Resume Genius', url: 'https://resumegenius.com/resume-templates' },
  ];

  // Return ATS friendly resume templates as JSON response
  res.json({ heading: 'ATS Friendly Resume Templates', resources: atsFriendlyResumeTemplates });
});

// Cover letter helpers endpoint
app.get('/cover-letter-helpers', (req, res) => {
  // Retrieve cover letter helpers from database or external source
  const coverLetterHelpers = [
    { name: 'The Balance Career', url: 'https://www.thebalancecareers.com/free-cover-letter-examples-and-writing-tips-2060208' },
    { name: 'Indeed', url: 'https://www.indeed.com/career-advice/cover-letter-samples' },
    { name: 'Monster', url: 'https://www.monster.com/career-advice/article/cover-letter-examples' },
    { name: 'Zety', url: 'https://zety.com/blog/cover-letter-examples' },
    { name: 'Novoresume', url: 'https://novoresume.com/cover-letter-examples' },
  ];

  // Return cover letter helpers as JSON response
  res.json({ heading: 'Cover Letter Helpers', resources: coverLetterHelpers });
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
//   "heading": "Cover Letter Helpers",
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
