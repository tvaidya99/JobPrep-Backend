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

        // remove duplicates from skilles in resume and skills not in resume
        let uniqueSkillsNotInResume = [...new Set(slicedSkills)];

        // now find the percentage of skills in resume out of not in resume and make that equal to matchscore
        let percentage = (noMatches / keySkills.length) * 100;
        matchScore = Math.round(percentage);

        if (matchScore >= 30) {
            matchScore = 100
            matchSuc.push(
                "You have a good match! Your skills match rate is: " +
                matchScore +
                "% against the job description."
            );

        } else if (matchScore >= 20) {
            matchScore = 70
            matchfail.push(
                "Add these skills to increase your Match rate:  " + uniqueSkillsNotInResume.join(", ")
            );
        }
        else {
            matchScore = 50
            matchfail.push(
                "Add these skills to increase your Match rate:  " + uniqueSkillsNotInResume.join(", ")
            );
        }


        let feedbackObject = { matchFeedback: { success: {}, fail: {} }, matchRate: 0 };
        // add the total to running total and append jason object for feedback with success and fail
        feedbackObject.matchFeedback.success = matchSuc;
        feedbackObject.matchFeedback.fail = matchfail;
        feedbackObject.matchRate = matchScore;
        return feedbackObject;
    }
};
