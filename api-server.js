const express = require("express");
const templates = require("./data/templates.json");
const interview = require("./data/interview.json");
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

app.get("/behavior_questions", (req, res) => {
  try {
    // Retrieve 8  random Behvior questions from the json file object behavior_question which has id and question
    const behaviorQuestions = interview["behavior_questions"].sort(
      () => 0.5 - Math.random()
    );
    const behaviorQuestions8 = behaviorQuestions.slice(0, 8);

    // Return behavior questions as JSON response (take out the id and just return the question)
    res.json(behaviorQuestions8.map((question) => question.question));
  } catch (err) {
    res.status(500);
  }
})

app.get("/technical_resources", (req, res) => {
  try {
    // Retrieve all technical resources from the json file object technical_resources which has id, title, and link
    const technicalResources = interview["technical_resources"];

    // Return technical resources as JSON response
    res.json(technicalResources);
  } catch (err) {
    res.status(500);
  }
})


// Start the server
app.listen(8090, () => {
  console.log("API is running on port 8090");
});
