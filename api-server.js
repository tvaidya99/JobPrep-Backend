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
    // Retrieve all behavior questions from the json file object behavior_questions which has id, question
    const behaviorQuestions = interview["behavior_questions"];
    // now check the total no of elements in the behaviorQuestions array and generate 8 random number between 0 and total no of elements put them in the array
    const randomNumbers = [];
    while (randomNumbers.length < 8) {
      const randomNumber = Math.floor(Math.random() * behaviorQuestions.length);
      if (!randomNumbers.includes(randomNumber)) {
        randomNumbers.push(randomNumber);
      }
    }
    // now get the 8 questions from matching indexes
    const randomQuestions = [];
    for (let i = 0; i < randomNumbers.length; i++) {
      randomQuestions.push(behaviorQuestions[randomNumbers[i]]);
    }
    // Return behavior questions as JSON response
    res.json(randomQuestions);
  } catch (err) {
    res.status(500);
  }
});


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
