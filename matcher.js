var dataBase = require("./data/parse-data.json");

module.exports = class Matcher {
    #extractedText;
    #jobDescription;

    // Constructor takes in the extracted text from the pdf
    constructor(extractedText, jobDescription) {
        this.#extractedText = extractedText;
        this.#jobDescription = jobDescription;
    }

    getMatchScore() {
        let matchScore = 100;
        let matchSuc = [];
        let matchfail = [];

        // Check for match
        const keySkills = [];

        const words = this.#jobDescription.toLowerCase().split(/[^a-z0-9]/);
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (dataBase.stopwords.includes(word) || word.length < 2) {
                continue;
            }
            keySkills.push(word);
        }

        for (let i = 0; i < dataBase.stopwords; i++) {
            if (dataBase.stopwords.includes(keySkills[i])) {
                keySkills.pop(keySkills[i]);
            }
        }

        let noMatches = 0;
        let skillsInResume = [];
        let skillsNotInResume = [];
        for (let i = 0; i < keySkills.length; i++) {
            if (this.#extractedText.includes(keySkills[i])) {
                noMatches += 1;
                skillsInResume.push(keySkills[i]);
            } else {
                skillsNotInResume.push(keySkills[i]);
            }
        }

        let slicedSkills = skillsNotInResume.slice(4, 9);
        let sliceedInResume = skillsInResume.slice(0, 9);

        if (noMatches / keySkills.length > 0.15) {
            matchSuc.push(
                "Match is greater than 50% with the following skills: " +
                sliceedInResume.toString().replace(",", ", ")
            );
        } else {
            matchfail.push(
                "Match is less than 50%, Add the following skills to increase your match: " +
                slicedSkills.toString().replace(",", ", ")
            );
            matchScore -= (noMatches / keySkills.length) * 100;
            matchScore = Math.round(matchScore);
        }
        let feedbackObject = {};
        feedbackObject.matchFeedback = {};

        // add the total to running total and append jason object for feedback with success and fail
        feedbackObject.matchFeedback.success = matchSuc;
        feedbackObject.matchFeedback.fail = matchfail;
        feedbackObject.matchRate = matchScore;
        return feedbackObject;
    }
}