var dataBase = require("./data/parse-data.json");

// Job Matcher class for checking the match rate of the resume with the job description
module.exports = class Matcher {
  #extractedText;
  #jobDescription;
  #stopwordsSet;

    // Constructor for the Matcher class
  constructor(extractedText, jobDescription) {
    this.#extractedText = extractedText;
    this.#jobDescription = jobDescription;
    this.#stopwordsSet = new Set(dataBase.stopwords);
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

    // If the match rate is greater than 30% then return a success message
    // Else return a fail message

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

    feedbackObject.matchRate = matchScore;

    return feedbackObject;
  }
};
