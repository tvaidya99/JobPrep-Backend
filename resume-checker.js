// This function will take the extratced text from the pdf and check it against the keywords
// Input: extractedText
// Output: score
// Feedback: feedback on each section

var dataBase = require("./data/parse-data.json");
var Matcher = require("./matcher");

module.exports = class resumeChecker {
    #extractedText;
    #jobDescription;
    #feedBack;
    #totalScore;

    // Constructor takes in the extracted text from the pdf
    constructor(extractedText, jobDescription) {
        this.#extractedText = extractedText;
        this.#jobDescription = jobDescription;
        this.#feedBack = {
            Feedback: {
                Formatting: { success: [], fail: [], score: 0 },
                Vocabulary: { success: [], fail: [], score: 0 },
                Brevity: { success: [], fail: [], score: 0 },
                FillerWords: { success: [], fail: [] },
            },
            Totalscore: 0,
            matchFeedback: {},
            matchRate: 0,
        };
        this.#totalScore = 0;
    }

    #updateScore(score) {
        this.#totalScore += score;
        return this.#totalScore;
    }

    // This can be simplified
    // Example - this.#feedBack.Feedback[section].success.push(success[i]);
    #updateFeedback(section, success, fail, score) {
        if (section == "Formatting") {
            for (let i = 0; i < success.length; i++) {
                this.#feedBack.Feedback.Formatting.success.push(success[i]);
            }
            for (let i = 0; i < fail.length; i++) {
                this.#feedBack.Feedback.Formatting.fail.push(fail[i]);
            }
            this.#feedBack.Feedback.Formatting.score = score;
        } else if (section == "Vocabulary") {
            for (let i = 0; i < success.length; i++) {
                this.#feedBack.Feedback.Vocabulary.success.push(success[i]);
            }
            for (let i = 0; i < fail.length; i++) {
                this.#feedBack.Feedback.Vocabulary.fail.push(fail[i]);
            }
            this.#feedBack.Feedback.Vocabulary.score = score;
        } else if (section == "Brevity") {
            for (let i = 0; i < success.length; i++) {
                this.#feedBack.Feedback.Brevity.success.push(success[i]);
            }
            for (let i = 0; i < fail.length; i++) {
                this.#feedBack.Feedback.Brevity.fail.push(fail[i]);
            }
            this.#feedBack.Feedback.Brevity.score = score;
        } else if (section == "FillerWords") {
            for (let i = 0; i < success.length; i++) {
                this.#feedBack.Feedback.FillerWords.success.push(success[i]);
            }
            for (let i = 0; i < fail.length; i++) {
                this.#feedBack.Feedback.FillerWords.fail.push(fail[i]);
            }
            this.#feedBack.Feedback.FillerWords.score = score;
        }
    }

    getResult() {
        this.#getFormattingScore();
        this.#getVocabScore();
        this.#getBrevityScore();
        this.#getFillerScore();
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

    #getFormattingScore() {
        let forMatScore = 40; // Total score for formatting
        let forMatSuc = []; // Array of successful formatting
        let forMatfail = []; // Array of failed formatting

        // Check for email, phone number, and linkedin
        const emailRegex =
            /(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi;
        const phoneRegex =
            /(\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4})/gi;
        const linkedInRegex =
            /(http(s)?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)\/([-a-zA-Z0-9]+)\/*/;
        if (this.#extractedText.match(emailRegex)) {
            forMatSuc.push(
                "Email Address is present: " + this.#extractedText.match(emailRegex)
            );
        } else {
            forMatfail.push("Email Address is missing");
            forMatScore -= 5; // Added 1 for Date
        }
        if (this.#extractedText.match(phoneRegex)) {
            forMatSuc.push(
                "Phone Number is present: " + this.#extractedText.match(phoneRegex)
            );
        } else {
            forMatfail.push("Phone Number is missing: -5 points");
            forMatScore -= 5; // Added 1 for Date
        }
        if (this.#extractedText.match(linkedInRegex)) {
            forMatSuc.push(
                "LinkedIn is present: " + this.#extractedText.match(linkedInRegex)[0]
            );
        } else {
            forMatfail.push("LinkedIn is missing: -5 points");
            forMatScore -= 5; // Added 3 for Date
        }
        // Check for section headings and add to score
        let educPresent = false;
        for (let i = 0; i < dataBase.patternEduc.length; i++) {
            let educRegexStr = "([\\\n])+" + dataBase.patternEduc[i] + "([\\\n])+";
            let educRegex = new RegExp(educRegexStr, "gi");
            if (this.#extractedText.match(educRegex)) {
                educPresent = true;
                break;
            }
        }
        if (educPresent) {
            forMatSuc.push("Education is present");
        } else {
            forMatfail.push("Education is missing: -8 points");
            forMatScore -= 8;
        }

        let expPresent = false;
        for (let i = 0; i < dataBase.patternExp.length; i++) {
            let expRegexStr = "([\\\n])+" + dataBase.patternExp[i] + "([\\\n])+";
            let expRegex = new RegExp(expRegexStr, "gi");
            if (this.#extractedText.match(expRegex)) {
                expPresent = true;
                break;
            }
        }
        if (expPresent) {
            forMatSuc.push("Experience is present");
        } else {
            forMatfail.push("Experience is missing: -8 points");
            forMatScore -= 8;
        }

        let skillsPresent = false;
        for (let i = 0; i < dataBase.patternSkills.length; i++) {
            let skillsRegexStr =
                "([\\\n])+" + dataBase.patternSkills[i] + "([\\\n])+";
            let skillsRegex = new RegExp(skillsRegexStr, "gi");
            if (this.#extractedText.match(skillsRegex)) {
                skillsPresent = true;
                break;
            }
        }
        if (skillsPresent) {
            forMatSuc.push("Skills are present");
        } else {
            forMatfail.push("Skills are missing: -4 points");
            forMatScore -= 4;
        }
        let extraActPresent = false;
        for (let i = 0; i < dataBase.patternExtraAct.length; i++) {
            let extraActRegexStr =
                "([\\\n])+" + dataBase.patternExtraAct[i] + "([\\\n])+";
            let extraActRegex = new RegExp(extraActRegexStr, "gi");
            if (this.#extractedText.match(extraActRegex)) {
                extraActPresent = true;
                break;
            }
        }
        if (extraActPresent) {
            forMatSuc.push("Extra Activities are present");
        } else {
            forMatfail.push("Extra Activities are missing: -2 points");
            forMatScore -= 2;
        }

        this.#updateScore(forMatScore);
        this.#updateFeedback("Formatting", forMatSuc, forMatfail, forMatScore);
    }

    #getVocabScore() {
        let vocabScore = 20;
        let vocabSuc = [];
        let vocabfail = [];
        let presentdWords = [];

        // Check for strong action words check how many times they are present and push to presentdWords accordingly
        for (let i = 0; i < dataBase.strongActionWords.length; i++) {
            let strongActionRegexStr = dataBase.strongActionWords[i];
            let strongActionRegex = new RegExp(strongActionRegexStr, "gi"); // g for global and i for case insensitive
            let strongActionMatch = this.#extractedText.match(strongActionRegex);
            if (strongActionMatch) {
                for (let j = 0; j < strongActionMatch.length; j++) {
                    presentdWords.push(strongActionMatch[j]);
                }
            }
        }

        // remove duplicates from presentWords and store in uniqueWords
        let uniqueWords = [...new Set(presentdWords)];

        if (uniqueWords.length >= 7) {
            vocabSuc.push(
                "Used sufficient strong action words. Used Strong Action Words: " +
                uniqueWords.join(", ")
            );
        } else {
            vocabfail.push("Used less than 7 strong action words: -7 points");
            vocabScore -= 7;
        }

        // Check the presentWoes for repeated words and for each word repeated more than twice subtract 1 from vocabScore until maxBuzz is 8
        let maxBuzz = 8;
        let repeatedWords = [];
        for (let i = 0; i < presentdWords.length; i++) {
            let word = presentdWords[i];
            let wordRegex = new RegExp(word, "gi");
            let wordMatch = this.#extractedText.match(wordRegex);
            if (wordMatch.length > 2) {
                repeatedWords.push(word);
                maxBuzz -= 1;
            }
        }

        // remove repeated words from repeatedWords
        repeatedWords = [...new Set(repeatedWords)];

        // message for repeated words
        if (repeatedWords.length > 0) {
            vocabfail.push(
                "Action words are repeated more than twice: " + repeatedWords.join(", " + " -1 points per word")
            );
        } else {
            vocabSuc.push("Avoided use of repeated action words more than twice.");
        }

        // Check for complex buzzwords use regex to check if any of the complex buzzwords are present in the text and if they are present subtract 1 from vocabScore and maxComplexBuzz
        let maxComplexBuzz = 5;
        let complexBuzzwords = [];
        for (
            let i = 0;
            i < dataBase.complexBuzzwords.length;
            i++ && maxComplexBuzz > 0
        ) {
            let complexBuzzRegexStr = dataBase.complexBuzzwords[i];
            let complexBuzzRegex = new RegExp(complexBuzzRegexStr, "gi"); // g for global and i for case insensitive
            if (this.#extractedText.match(complexBuzzRegex)) {
                maxComplexBuzz -= 1;
                vocabScore -= 1;
                complexBuzzwords.push(dataBase.complexBuzzwords[i]);
            }
        }

        if (maxComplexBuzz == 0) {
            vocabfail.push(
                "Complex Buzzwords are present in the text: " +
                complexBuzzwords.join(", ") + " -1 points per word"
            );
        } else {
            vocabSuc.push("Avoided use of Complex Buzzwords.");
        }

        // add the total to running total and append jason object for feedback with success and fail
        this.#updateScore(vocabScore);
        this.#updateFeedback("Vocabulary", vocabSuc, vocabfail, vocabScore);
    }

    #getBrevityScore() {
        let brevityScore = 20;
        let brevitySuc = [];
        let brevityfail = [];

        // Check for word count - 8%
        const words = this.#extractedText.split(" ");
        // minimum recommended length = 475 - 600 words
        if (words.length >= 475 && words.length <= 600) {
            brevitySuc.push("Word Count is between 475 - 600 words.");
        } else {
            brevityfail.push(
                "Word Count is: " + words.length + ". Must be between 475 - 600 words: -8 points"
            );
            brevityScore -= 8;
        }

        let extractedBulletPoints = this.#extractedText.split(
            /[•‣⁃⁌⁍∙○●◘◦☙❥❧⦾⦿–][\n]*/g
        );
        if (extractedBulletPoints.length > 1) {
            brevitySuc.push("Bullet points are used to convey information.");

            // Check Bullet Points word length - 5%
            // remove the first entry as bullet points start after the first index
            const bulletPoints = extractedBulletPoints.splice(
                1,
                extractedBulletPoints.length
            );
            const maxLengthBullet = 30;
            let maxpoint = 5;
            for (let i = 0; i < bulletPoints.length; i++) {
                if (bulletPoints[i].split(" ").length >= maxLengthBullet) {
                    maxpoint -= 1;
                    if (maxpoint == 0) break;
                }
            }
            // allow two lengthy bullet points for error correction in parsing
            if (maxpoint < 3) {
                brevityfail.push("Bullet Points must be less than 30 words: -5 points");
                brevityScore -= 5;
            } else {
                brevitySuc.push("Bullet Points are less than 30 words.");
            }

            // Check number of Bullet Points - 5%
            // 16 bullet points is a fair estimate
            // 16 bullets x 15 words = 320 words (~70% of the minimum resume length)
            if (bulletPoints.length < 16) {
                brevityfail.push("Bullet Points are less than 16 in total: -5 points");
                brevityScore -= 5;
            } else {
                brevitySuc.push("More than 16 bullet points are present.");
            }
        } else {
            brevityfail.push("Unable to parse Bullet Points: -12 Points"); // -12%
            brevityScore -= 12;
        }

        // add the total to running total and append jason object for feedback with success and fail
        this.#updateScore(brevityScore);
        this.#updateFeedback("Brevity", brevitySuc, brevityfail, brevityScore);
    }

    #getFillerScore() {
        let fillerScore = 20;
        let fillerSuc = [];
        let fillerfail = [];

        // Check for filler words use regex to check if any of the filler words are present in the text and if they are present subtract 1 from fillerScore and maxFiller
        let fillerWordsUsed = [];
        let maxFiller = 5;
        for (let i = 0; i < dataBase.fillerWords.length; i++ && maxFiller > 0) {
            let fillerRegexStr = dataBase.fillerWords[i];
            let fillerRegex = new RegExp(fillerRegexStr, "gi"); // g for global and i for case insensitive
            if (this.#extractedText.match(fillerRegex)) {
                maxFiller -= 1;
                fillerScore -= 1;
                fillerWordsUsed.push(dataBase.fillerWords[i]);
            }
        }

        if (maxFiller == 0 && dataBase.fillerWords.length > 0) {
            fillerfail.push(
                "Filler Words are present here is the list of words you can replace to increase your score: " +
                fillerWordsUsed.toString().replaceAll(",", ", ") + " -10 points"
            );
            fillerScore -= 10;
        } else {
            fillerSuc.push("Filler Words are not present");
        }

        // now check for overuse of filler words for every 2 filler words over 10,  1 point is deducted
        let fillerLimit = 10;
        if (fillerWordsUsed.length > 10) {
            for (let i = 0; i < fillerLimit.length; i++ && fillerLimit > 0) {
                fillerLimit -= 2;
                fillerScore -= 1;
            }
            fillerfail.push("Filler Words are overused: -1 point per 2 words");
        }

        // add the total to running total and append jason object for feedback with success and fail
        this.#updateScore(fillerScore);
        this.#updateFeedback("FillerWords", fillerSuc, fillerfail, fillerScore);
    }
};
