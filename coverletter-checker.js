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
      const name = this.#extractedText
        .match(NAME_REGEX)[0]
        .replace(/Dear\s+/, "");
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
    let maxDeduct = 0;
    // Check for action verbs from the database and for every match add 3 to the score until total for this element of vocabulary is 25 use of regex for search
    for (let i = 0; i < dataBase.strongActionWords.length; i++) {
      if (this.#extractedText.match(dataBase.strongActionWords[i])) {
        strongActionWordsPresent.push(dataBase.strongActionWords[i]);
      }
    }

    // remove duplicates from strongActionWordsPresent
    let uniqueWords = [...new Set(strongActionWordsPresent)];

    if (uniqueWords.length > 6) {
      vocabularyScore += 30;
      this.#feedBack.Feedback.Vocabulary.success.push(
        "Strong Action Words used: " + uniqueWords
      );
    } else
      [
        (vocabularyScore += uniqueWords.length * 5),
        this.#feedBack.Feedback.Vocabulary.success.push(
          "Strong Action Words used: " +
            uniqueWords +
            " Add more strong action words to your cover letter"
        ),
      ];

    vocabularyScore += 20; // for the following criteria
    maxDeduct = 20; // max deduction for the following criteria

    // check strongActionWordPresent for every occurence used more then twice take 4 point away from the vocabulary score until maxDeduct is reached
    for (let i = 0; i < uniqueWords.length; i++) {
      if (this.#extractedText.match(uniqueWords[i]).length > 2) {
        if (maxDeduct > 0) {
          vocabularyScore -= 4;
          maxDeduct -= 4;
          this.#feedBack.Feedback.Vocabulary.fail.push(
            "This strong action word " +
              uniqueWords[i] +
              " is used more than twice in the cover letter"
          );
        }
      }
    }

    maxDeduct = 10; // max deduction for the following criteria

    // check for complex buzzword for every occurence used take 3 point away from the vocabulary score unitl maxDeduct is reached
    for (let i = 0; i < dataBase.complexBuzzwords.length; i++) {
      if (this.#extractedText.match(dataBase.complexBuzzwords[i])) {
        if (maxDeduct > 0) {
          vocabularyScore -= 3;
          maxDeduct -= 3;
          this.#feedBack.Feedback.Vocabulary.fail.push(
            "This complex buzzword " +
              dataBase.complexBuzzwords[i] +
              " is used in the cover letter"
          );
        }
      }
    }

    // Add the running score to total score
    this.#updateScore(vocabularyScore);
    this.#feedBack.Feedback.Vocabulary.score.push(vocabularyScore);
  }

  // Brevity Check
  #getCoverLetterBrevity() {
    let brevityScore = 15;
    // check for the total number of words in the cover letter

    const wordRegexV = /[\w\d\’\'-]+/gi;
    const word = this.#extractedText.match(wordRegexV);
    if (word) {
      if (word.length > 400) {
        this.#feedBack.Feedback.Brevity.fail.push(
          "The cover letter has more than 400 words"
        );
        brevityScore -= 15;
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
