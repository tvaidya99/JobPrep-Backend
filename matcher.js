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

  // Method to get the match rate of the resume with the job description
  getMatchScore() {
    const keySkills = new Set(
      this.#jobDescription
        .toLowerCase()
        .split(/\W+/)
        .filter((word) => !this.#stopwordsSet.has(word) && word.length >= 2)
    );
    const skillsInResume = new Set();
    const skillsNotInResume = new Set();
    let noMatches = 0;


    for (let skill of keySkills) {
      if (this.#extractedText.includes(skill)) {
        noMatches++;
        skillsInResume.add(skill);
      } else {
        skillsNotInResume.add(skill);
      }
    }

    let uniqueSkillsNotInResume = [...skillsNotInResume].slice(4, 9);

    let matchScore = Math.round((noMatches / keySkills.size) * 100);

    let feedbackObject = {
      matchFeedback: { success: [], fail: [] },
      matchRate: 0,
    };

    // If the match rate is greater than 30% then return a success message
    // Else return a fail message

    if (matchScore >= 30) {
      matchScore = 100;
      feedbackObject.matchFeedback.success.push(
        "You have a good match! Your skills match rate is: " +
          matchScore +
          "% against the job description."
      );
    } 
    else if (matchScore >= 20) {
        matchScore = 80;
        feedbackObject.matchFeedback.success.push(
            "You have a good match! Your skills match rate is: " +
            matchScore +
            "% against the job description."
        );
    }
    else {
      matchScore = 65;
      feedbackObject.matchFeedback.fail.push(
        "Add these skills to increase your Match rate:  " +
          uniqueSkillsNotInResume.join(", ")
      );
    }

    feedbackObject.matchRate = matchScore;

    return feedbackObject;
  }
};
