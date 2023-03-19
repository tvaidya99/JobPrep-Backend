// Cover Letter Checker
// This will take the extracted text and check the cover letter against a list of keywords and algorithm to determine the score and output.
// The class has getResult() function which returns the result of the cover letter check

var dataBase = require("./data/parse-data.json");

module.exports = class coverLetterChecker {
  constructor(extractedText) {
    this.extractedText = extractedText;
    this.feedBack = {
      Feedback: {
        Formatting: { Success: [], Fail: [], Score: [] },
        Vocabulary: { Success: [], Fail: [], Score: [] },
        Brevity: { Success: [], Fail: [], Score: [] },
      },
      TotalScore: 0,
    };
    this.totalScore = 0;
  } // Constructor takes in the extracted text from the pdf

  updateScore(score) {
    this.totalScore += score;
    return this.totalScore;
  }

  getResult() {
    this.getCoverLetterFormatting();
    this.getCoverLetterVocabulary();
    this.getCoverLetterBrevity();
    this.feedBack.TotalScore = this.totalScore;
    return this.feedBack;
  }

  // Formatting Check

  getCoverLetterFormatting() {
    let formattingScore = 30;

    // check for the date
    const dateRegex =
      /^(0?[1-9]|[1-2][0-9]|3[0-1])\/(0?[1-9]|1[0-2])\/([1-9][0-9]{3})$|^(0?[1-9]|1[0-2])\/(0?[1-9]|[1-2][0-9]|3[0-1])\/([1-9][0-9]{3})$/;
    const date = this.extractedText.match(dateRegex);
    if (date) {
      this.feedBack.Feedback.Formatting.Success.push(
        "Date on Cover Letter is " + date[0]
      );
    } else {
      this.feedBack.Feedback.Formatting.Fail.push(
        "Date on Cover Letter is missing"
      );
      formattingScore -= 10;
    }

    // Check for Email address
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const email = this.extractedText.match(emailRegex);
    if (email) {
      this.feedBack.Feedback.Formatting.Success.push(
        "Email on Cover Letter is " + email[0]
      );
    } else {
      this.feedBack.Feedback.Formatting.Fail.push(
        "Email on Cover Letter is missing"
      );
      formattingScore -= 10;
    }

    // Check for Name of the Recipient
    const nameRegex = /Dear\s([a-zA-Z\s]+),/;
    const name = this.extractedText.match(nameRegex);
    if (name) {
      this.feedBack.Feedback.Formatting.Success.push(
        "This letter is addressed to " + name[1]
      );
    } else {
      this.feedBack.Feedback.Formatting.Fail.push(
        "Name on Cover Letter is missing"
      );
      formattingScore -= 10;
    }

    // Add the running score to total score
    this.updateScore(formattingScore);
    this.feedBack.Feedback.Formatting.Score.push(formattingScore);
  }

  // Vocabulary Check

  getCoverLetterVocabulary() {
    let vocabularyScore = 0;

    // Check for action verbs from tge database and for every match add 3 to the score until total for this element of vaoabulary is 25

    for (let i = 0; i < dataBase.strongActionWords.length; i++) {
      if (this.extractedText.match(dataBase.strongActionWords[i])) {
        vocabularyScore += 3;
        this.feedBack.Feedback.Vocabulary.Success.push(
          "The word " +
          dataBase.strongActionWords[i] +
          " is present in the cover letter"
        );
      }
    }

    if (vocabularyScore > 25) {
      vocabularyScore = 25;
    } else {
      this.feedBack.Feedback.Vocabulary.Fail.push(
        "Please add more action words to the cover letter to increase the score"
      );
    }

    vocabularyScore += 20; // for the buzzwords and complex buzzwords check

    // check for buzzword for every buzzword used more than 2 times take 1 point away from the vocabulary score
    for (let i = 0; i < dataBase.buzzWords.length; i++) {
      let count = 0;
      for (let j = 0; j < this.extractedText.length; j++) {
        if (this.extractedText[j] === dataBase.buzzWords[i]) {
          count += 1;
        }
      }
      if (count > 2) {
        vocabularyScore -= 1;
        this.feedBack.Feedback.Vocabulary.Fail.push(
          "The word " + dataBase.buzzWords[i] + " is used more than twice times"
        );
      }
    }

    // check for complex buzzword for every buzzword used take 1 point away from the vocabulary score
    for (let i = 0; i < dataBase.complexBuzzwords.length; i++) {
      if (this.extractedText.match(dataBase.complexBuzzwords[i])) {
        vocabularyScore -= 1;
        this.feedBack.Feedback.Vocabulary.Fail.push(
          "This complex buzzword " +
          dataBase.complexBuzzwords[i] +
          " is used in the cover letter"
        );
      }
    }

    // Add the running score to total score
    this.updateScore(vocabularyScore);
    this.feedBack.Feedback.Vocabulary.Score.push(vocabularyScore);
  }

  // Brevity Check
  getCoverLetterBrevity() {
    let brevityScore = 25;

    // check for the total number of paragraphs after the dear name and before the salutation
    const paragraphRegex =
      /Dear\s+([a-zA-Z\s]+),?[\r\n\s]+([\s\S]*?)[\r\n\s]*(?:Sincerely|Best regards|Best|Kind regards|Regards|Yours truly|Yours faithfully|Respectfully yours|Cordially|Warm regards|Warmly|Thank you|Thanks)[,.\s]*(?:\r\n|\r|\n)*[\r\n\s]+([a-zA-Z\s]+)/;
    const paragraph = this.extractedText.match(paragraphRegex);
    let paragraphArray;
    if (paragraph) {
      paragraphArray = paragraph[2].split("\n");
      if (paragraphArray.length > 5) {
        this.feedBack.Feedback.Brevity.Fail.push(
          "The cover letter has more than 5 paragraphs"
        );
        brevityScore -= 10;
      } else {
        this.feedBack.Feedback.Brevity.Success.push(
          "The cover letter has less than or equal to 5 paragraphs"
        );
      }
    } else {
      this.feedBack.Feedback.Brevity.Fail.push(
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
        this.feedBack.Feedback.Brevity.Fail.push(
          "The cover letter has " +
          overLimitPara +
          " paragraphs with more than 100 words"
        );
        brevityScore -= overLimitPara * 2;
      } else {
        this.feedBack.Feedback.Brevity.Success.push(
          "The cover letter has no paragraphs with more than 100 words"
        );
      }
    }

    // check for the total number of words in the cover letter

    const wordRegexV = /[\w\d\’\'-]+/gi;
    const word = this.extractedText.match(wordRegexV);
    if (word) {
      if (word.length > 400) {
        this.feedBack.Feedback.Brevity.Fail.push(
          "The cover letter has more than 400 words"
        );
        brevityScore -= 5;
      } else {
        this.feedBack.Feedback.Brevity.Success.push(
          "The cover letter has less than or equal to 400 words"
        );
      }
    }

    // Add the running score to total score
    this.updateScore(brevityScore);
    this.feedBack.Feedback.Brevity.Score.push(brevityScore);
  }
}

// Test for the the class and the functions
// const textCover = String.raw`Dear Hiring Manager,\n\nI am Nirav Pandya and I am applying for the Data Analyst position at your company. I am excited about the opportunity to work with a team that is passionate about utilizing data to drive business decisions.\n\nI have a strong background in statistics and data analysis, with experience in both academic and professional settings. I am proficient in data analysis tools such as Excel, Python, and SQL, and have experience working with large datasets.\n\nI am confident that my skills and experience make me a strong candidate for this position. Thank you for considering my application. I look forward to the opportunity to discuss my qualifications further.\n\nSincerely,\nNirav Pandya\nEmail: niravpandya411@gmail.com\nPhone: 555-555-5555`;

// const coverLetter = new coverLetterChecker(textCover);

// coverLetterResult = coverLetter.getCoverLetterResult();

// console.log(coverLetterResult.TotalScore);
// console.log(coverLetterResult.Feedback);

// Output
