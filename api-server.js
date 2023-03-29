const express = require("express");
const templates = require("./data/templates.json");
const app = express();

/*
Only for dev purposes
*/
const cors = require("cors");
const corsOptions = {
  origin: "*",
  methods: ["POST", "GET"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));

// ATS friendly resume templates endpoint
app.get("/templates", (req, res) => {
  try {
    // Retrieve ATS friendly resume templates from database or external source
    const atsFriendlyResumeTemplates = templates["resume-templates"];

    // Retrieve cover letter helpers from database or external source
    const coverLetterHelpers = templates["cover-letter-templates"];

    // Return ATS friendly resume templates as JSON response
    res.json([
      {
        heading: "ATS Friendly Resume Templates",
        resources: atsFriendlyResumeTemplates,
      },
      {
        heading: "ATS Friendly Cover Letter Templates",
        resources: coverLetterHelpers,
      },
    ]);
  } catch (err) {
    res.status(500);
  }
});

// Start the server
app.listen(8090, () => {
  console.log("API is running on port 8090");
});
