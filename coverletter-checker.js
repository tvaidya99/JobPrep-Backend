// Cover Letter Checker
// This will take the extracted text and check the cover letter against a list of keywords and algorithm to determine the score and output.
// The class has getResult() function which returns the result of the cover letter check

var dataBase = require("./data/parse-data.json");
var Matcher = require("./matcher");

module.exports = class coverLetterChecker {
  #extractedText;
  #jobDescription;
  #feedBack;
  #totalScore;
  constructor(extractedText, jobDescription) {
    this.#extractedText = extractedText;
    this.#jobDescription = jobDescription;
    this.#feedBack = {
      Feedback: {
        Formatting: { success: [], fail: [], score: [] },
        Vocabulary: { success: [], fail: [], score: [] },
        Brevity: { success: [], fail: [], score: [] },
      },
      Totalscore: 0,
      matchFeedback: {},
      matchRate: 0,
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
    if (this.#jobDescription) {
      let matchResults = new Matcher(
        this.#extractedText,
        this.#jobDescription
      ).getMatchScore();
      this.#feedBack.matchFeedback = matchResults.matchFeedback;
      this.#feedBack.matchRate = matchResults.matchRate;
    }
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
        "Date on Cover Letter is missing: -10 points"
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
        "Email on Cover Letter is missing: -10 points"
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
        "Formatting Error: Dear is not followed by a name: -10 points"
      );
      formattingScore -= 10;
    }

    // Add the running score to total score
    this.#updateScore(formattingScore);;
    this.#feedBack.Feedback.Formatting.score.push(formattingScore.toString() + "/30");
  }

  // Vocabulary Check
  #getCoverLetterVocabulary() {
    let vocabularyScore = 0;
    let strongActionWordsPresent = [];
    let maxDeduct = 0;
    // Check for action verbs from the database and for every match add 3 to the score until total for this element of vocabulary is 25
    // use of regex for search
    for (let i = 0; i < dataBase.strongActionWords.length; i++) {
      if (this.#extractedText.match(dataBase.strongActionWords[i])) {
        strongActionWordsPresent.push(dataBase.strongActionWords[i]);
      }
    }

    // remove duplicates from strongActionWordsPresent
    let uniqueWords = [...new Set(strongActionWordsPresent)];

    if (uniqueWords.length >= 6) {
      vocabularyScore += 30;
      this.#feedBack.Feedback.Vocabulary.success.push(
        "At least 6 Strong Action Words used: " + uniqueWords
      );
    }
    else if (uniqueWords.length < 6 && uniqueWords.length > 0) {
      vocabularyScore += uniqueWords.length * 5;
      this.#feedBack.Feedback.Vocabulary.fail.push(
        "Strong Action Words used: " +
        uniqueWords.toString().replaceAll(",", ", ") +
        ". Add at least 6 strong action words to your cover letter." + " -" + (30 - vocabularyScore) + " points"
      )
    }
    else {
      this.#feedBack.Feedback.Vocabulary.fail.push(
        "No Strong Action Words used in your cover letter: -30 points"
      );
    };

    if (uniqueWords.length > 0) {
      vocabularyScore += 15;
      maxDeduct = 15; // max deduction for the following criteria

      let repeatedStrongWords = [];
      // check strongActionWordPresent for every occurence used more then twice take 5 point away from the vocabulary score until maxDeduct is reached
      for (let i = 0; i < uniqueWords.length; i++) {
        if (this.#extractedText.match(uniqueWords[i]).length > 2) {
          if (maxDeduct > 0) {
            vocabularyScore -= 5;
            maxDeduct -= 5;
            repeatedStrongWords.push(uniqueWords[i]);
          }
        }
      }
      if (repeatedStrongWords.length > 0) {
        this.#feedBack.Feedback.Vocabulary.fail.push(
          "Strong action words: "
          + repeatedStrongWords.toString().replaceAll(',', ', ') +
          " are used more than twice in the cover letter:" + " -" + maxDeduct + " points"
        );
      } else {
        this.#feedBack.Feedback.Vocabulary.success.push("Avoided use of repeated action words more than twice.")
      }
    }
    else {
      vocabularyScore += 15;
    }

    vocabularyScore += 10 // add 10 points for the use of buzzwords
    maxDeduct = 10; // max deduction for the following criteria
    let repeatedComplexWords = [];

    // check for complex buzzword - for every occurence, take 3 point away from the vocabulary score until maxDeduct is reached
    for (let i = 0; i < dataBase.complexBuzzwords.length; i++) {
      if (this.#extractedText.match(dataBase.complexBuzzwords[i])) {
        if (maxDeduct > 0) {
          vocabularyScore -= 3;
          maxDeduct -= 3;
          repeatedComplexWords.push(dataBase.complexBuzzwords[i]);
        }
      }
    }

    if (repeatedComplexWords.length > 0) {
      this.#feedBack.Feedback.Vocabulary.fail.push(
        "Complex Buzz words: "
        + repeatedComplexWords.toString().replaceAll(',', ', ') +
        " are used in the cover letter." + " -" + maxDeduct + " points"
      );
    } else {
      this.#feedBack.Feedback.Vocabulary.success.push("Avoided use of complex buzz words.");
    }

    // Add the running score to total score
    this.#updateScore(vocabularyScore);
    this.#feedBack.Feedback.Vocabulary.score.push(vocabularyScore.toString() + "/55");
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
          "The cover letter has more than 400 words: -15 points"
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
    this.#feedBack.Feedback.Brevity.score.push(brevityScore.toString() + "/15");
  }
};
