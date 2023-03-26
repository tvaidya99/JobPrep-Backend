const http = require("http");
const WebSocket = require("ws");
const pdfjsLib = require("pdfjs-dist");
const resumeChecker = require("./resume-checker.js");
const coverLetterChecker = require("./coverletter-checker");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", async function (message) {
    const data = JSON.parse(message);

    // Check if a file was sent
    if (data) {
      console.log("Received file/s from client!");

      // Extract string text from base64 file
      async function getExtractedText(fileBase64) {
        // Convert the file buffer back to PDF
        const file = Uint8Array.from(Buffer.from(fileBase64, "base64"));
        const pdf = await pdfjsLib.getDocument(file).promise;

        // Extract the text from each page of the PDF
        const numPages = pdf.numPages;
        let extractedText = "";
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item) => item.str).join("\n");
          extractedText += pageText;
        }
        return extractedText;
      }
      let results = {};

      // parse resume
      if (data.resume) {
        resumeScan = new resumeChecker(await getExtractedText(data.resume), data.job_description);
        results.resume = resumeScan.getResult();
      }

      // parse cover letter
      if (data.cover_letter) {
        coverLetterScan = new coverLetterChecker(
          await getExtractedText(data.cover_letter)
        );
        results.cover_letter = coverLetterScan.getResult();
      }

      // Send the extracted text back to the client
      socket.send(JSON.stringify(results));
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(8080, () => {
  console.log("Server started on port 8080");
});

// Specification for the ResumeChecker class
// Path: ResumeChecker.js
// ResumeChecker class takes the extracted text from the resume and checks it against a list of keywords and algorithm
// to determine the score and output.
// the class has getresult() function which returns the result of the resume check.
// the Result is an  JSON Object with the following properties:
// result.TotalScore: the total score of the resume
// Structure of JSON Object: [Formatting: {Success: [], Fail: [], Score: []}, Vocabulary: {Success: [], Fail: [], Score: []}, Brevity: {Success: [], Fail: [], Score: []}, FillerWords: {Success: [], Fail: [], Score: []}, TotalScore: 0}]
