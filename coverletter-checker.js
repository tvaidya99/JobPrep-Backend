// Cover Letter Checker
// This will take the extracted text and check the cover letter against a list of keywords and algorithm to determine the score and output.
// The class has getResult() function which returns the result of the cover letter check

var dataBase = require("./data/parse-data.json");

module.exports = class coverLetterChecker {
  #extractedText;
  #feedBack;
  #totalScore;
  constructor(extractedText) {
    this.#extractedText = extractedText;
    this.#feedBack = {
      Feedback: {
        Formatting: { success: [], fail: [], score: [] },
        Vocabulary: { success: [], fail: [], score: [] },
        Brevity: { success: [], fail: [], score: [] },
      },
      Totalscore: 0,
    };
    this.#totalScore = 0;
  } // Constructor takes in the extracted text from the pdf

  #updateScore(score) {
    this.#totalScore += score;
    return this.#totalScore;
  }

  getResult() {
    this.#getCoverLetterFormatting();
    this.#getCoverLetterVocabulary();
    this.#getCoverLetterBrevity();
    this.#feedBack.Totalscore = this.#totalScore;
    return this.#feedBack;
  }

  // Formatting Check
  #getCoverLetterFormatting() {
    let formattingScore = 30;

    // check for the date
    const dateRegex =
      /\b(?:\d{1,2}\s+)?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s*\d{4}?\b/g;

    const date = this.#extractedText.match(dateRegex);
    if (date) {
      this.#feedBack.Feedback.Formatting.success.push(
        "Date on Cover Letter is " + date[0]
      );
    } else {
      this.#feedBack.Feedback.Formatting.fail.push(
        "Date on Cover Letter is missing"
      );
      formattingScore -= 10;
    }

    // Check for Email address
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const email = this.#extractedText.match(emailRegex);
    if (email) {
      this.#feedBack.Feedback.Formatting.success.push(
        "Email on Cover Letter is " + email[0]
      );
    } else {
      this.#feedBack.Feedback.Formatting.fail.push(
        "Email on Cover Letter is missing"
      );
      formattingScore -= 10;
    }

    // Check for Name of the Recipient
    const NAME_REGEX = /Dear\s+([A-Za-z./]+(\s+[A-Za-z]+)*)/;
    if (NAME_REGEX.test(this.#extractedText)) {
      const name = this.#extractedText.match(NAME_REGEX)[0].replace(/Dear\s+/, "");
      this.#feedBack.Feedback.Formatting.success.push(
        "Cover Letter is addressed to " + name
      );
    } else {
      this.#feedBack.Feedback.Formatting.fail.push(
        "Formatting Error: Dear is not followed by a name"
      );
      formattingScore -= 10;
    }

    // Add the running score to total score
    this.#updateScore(formattingScore);
    this.#feedBack.Feedback.Formatting.score.push(formattingScore);
  }

  // Vocabulary Check
  #getCoverLetterVocabulary() {
    let vocabularyScore = 0;
    let strongActionWordsPresent = [];
    // Check for action verbs from the database and for every match add 3 to the score until total for this element of vocabulary is 25
    for (let i = 0; i < dataBase.strongActionWords.length; i++) {
      if (this.#extractedText.match(dataBase.strongActionWords[i])) {
        vocabularyScore += 3;
        strongActionWordsPresent.push(dataBase.strongActionWords[i]);
        if (vocabularyScore > 25) {
          vocabularyScore = 25;
          this.#feedBack.Feedback.Vocabulary.success.push("At least 9 strong action words are present.");
          break;
        };
      }
    }

    if (vocabularyScore < 25) {
      let actionWordFeedback = "No action words found. ";
      if(strongActionWordsPresent.length > 0){
        actionWordFeedback = "Action words found: " + strongActionWordsPresent.toString() + ". ";
      }
      this.#feedBack.Feedback.Vocabulary.fail.push(
        actionWordFeedback +
        "Please add at least 9 action words to the cover letter to increase the score."
      );
    }

    vocabularyScore += 20; // for the following criteria

    // for every strongActionWords used more than 2 times take 1 point away from the vocabulary score
    for (let i = 0; i < dataBase.strongActionWords.length; i++) {
      let count = 0;
      for (let j = 0; j < dataBase.strongActionWords[i]; j++) {
        if (this.#extractedText[j] === dataBase.strongActionWords[i]) {
          count += 1;
        }
      }
      if (count > 2) {
        vocabularyScore -= 1;
        this.#feedBack.Feedback.Vocabulary.fail.push(
          "The word " + dataBase.strongActionWords[i] + " is used more than twice times"
        );
      }
    }

    // check for complex buzzword for every occurence used take 1 point away from the vocabulary score
    for (let i = 0; i < dataBase.complexBuzzwords.length; i++) {
      if (this.#extractedText.match(dataBase.complexBuzzwords[i])) {
        vocabularyScore -= 1;
        this.#feedBack.Feedback.Vocabulary.fail.push(
          "This complex buzzword " +
          dataBase.complexBuzzwords[i] +
          " is used in the cover letter"
        );
      }
    }

    // Add the running score to total score
    this.#updateScore(vocabularyScore);
    this.#feedBack.Feedback.Vocabulary.score.push(vocabularyScore);
  }

  // Brevity Check
  #getCoverLetterBrevity() {
    let brevityScore = 25;

    // check for the total number of paragraphs after the dear name and before the salutation
    const paragraphRegex =
      /Dear\s+([a-zA-Z./\s]+),?[\r\n\s]+([\s\S]*?)[\r\n\s]*(?:Sincerely|Best regards|Best|Kind regards|Regards|Yours truly|Yours faithfully|Respectfully yours|Cordially|Warm regards|Warmly|Thank you|Thanks)[,.\s]*(?:\r\n|\r|\n)*[\r\n\s]+([a-zA-Z\s]+)/;
    const paragraph = this.#extractedText.match(paragraphRegex);
    let paragraphArray;
    if (paragraph) {
      paragraphArray = paragraph[2].split("\n");
      if (paragraphArray.length > 30) {
        this.#feedBack.Feedback.Brevity.fail.push(
          "The cover letter has more than 5 paragraphs"
        );
        brevityScore -= 10;
      } else {
        this.#feedBack.Feedback.Brevity.success.push(
          "The cover letter has less than or equal to 5 paragraphs"
        );
      }
    } else {
      this.#feedBack.Feedback.Brevity.fail.push(
        "The cover letter is not formatted correctly - no paragraphs detected"
      );
      brevityScore -= 10;
    }

    // Check for paragraphs with more than 100 words for every paragraph with more than 100 words take 2 points away from the brevity score the limit of scre taken out is 10
    if (paragraph) {
      let overLimitPara = 0; // this is to keep track of the number of paragraphs with more than 100 words
      for (let i = 0; i < paragraphArray.length; i++) {
        const wordRegex = /[\w\d\’\'-]+/gi;
        const wordPara = paragraphArray[i].match(wordRegex);
        if (wordPara) {
          if (wordPara.length > 100) {
            overLimitPara += 1;
          }
        }
      }

      if (overLimitPara > 0) {
        if (overLimitPara > 5) {
          overLimitPara = 5;
        }
        this.#feedBack.Feedback.Brevity.fail.push(
          "The cover letter has " +
          overLimitPara +
          " paragraphs with more than 100 words"
        );
        brevityScore -= overLimitPara * 2;
      } else {
        this.#feedBack.Feedback.Brevity.success.push(
          "The cover letter has no paragraphs with more than 100 words"
        );
      }
    }

    // check for the total number of words in the cover letter

    const wordRegexV = /[\w\d\’\'-]+/gi;
    const word = this.#extractedText.match(wordRegexV);
    if (word) {
      if (word.length > 400) {
        this.#feedBack.Feedback.Brevity.fail.push(
          "The cover letter has more than 400 words"
        );
        brevityScore -= 5;
      } else {
        this.#feedBack.Feedback.Brevity.success.push(
          "The cover letter has less than or equal to 400 words"
        );
      }
    }

    // Add the running score to total score
    this.#updateScore(brevityScore);
    this.#feedBack.Feedback.Brevity.score.push(brevityScore);
  }
};

// Test for the the class and the functions
// const textCover = String.raw`Dear Hiring Manager,\n\nI am Nirav Pandya and I am applying for the Data Analyst position at your company. I am excited about the opportunity to work with a team that is passionate about utilizing data to drive business decisions.\n\nI have a strong background in statistics and data analysis, with experience in both academic and professional settings. I am proficient in data analysis tools such as Excel, Python, and SQL, and have experience working with large datasets.\n\nI am confident that my skills and experience make me a strong candidate for this position. Thank you for considering my application. I look forward to the opportunity to discuss my qualifications further.\n\nSincerely,\nNirav Pandya\nEmail: niravpandya411@gmail.com\nPhone: 555-555-5555`;

// const coverLetter = new coverLetterChecker(textCover);

// coverLetterResult = coverLetter.getCoverLetterResult();

// console.log(coverLetterResult.TotalScore);
// console.log(coverLetterResult.Feedback);

// Output
