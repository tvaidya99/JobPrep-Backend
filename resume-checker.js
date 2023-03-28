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
            matchFeedback: {
            },
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
            let matchResults = new Matcher(this.#extractedText, this.#jobDescription).getMatchScore();
            this.#feedBack.matchFeedback = matchResults.matchFeedback;
            this.#feedBack.matchRate = matchResults.matchRate;
        }
        this.#feedBack.Totalscore = this.#totalScore;

        return this.#feedBack;
    }

    /** Need to work on the following:
     * 
     * 
     * */
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
            forMatfail.push("Phone Number is missing");
            forMatScore -= 5; // Added 1 for Date
        }
        if (this.#extractedText.match(linkedInRegex)) {
            forMatSuc.push("LinkedIn is present: " + this.#extractedText.match(linkedInRegex)[0]);
        } else {
            forMatfail.push("LinkedIn is missing");
            forMatScore -= 5; // Added 3 for Date
        }
        // Check for section headings and add to score
        let educPresent = false;
        for (let i = 0; i < dataBase.patternEduc.length; i++) {
            let educRegexStr = '([\\\n])+' + dataBase.patternEduc[i] + '([\\\n])+';
            let educRegex = new RegExp(educRegexStr, "gi");
            if (this.#extractedText.match(educRegex)) {
                console.log(this.#extractedText.match(educRegex)[0]);
                educPresent = true;
                break;
            }
        }
        if (educPresent) {
            forMatSuc.push("Education is present");
        } else {
            forMatfail.push("Education is missing");
            forMatScore -= 8;
        }

        let expPresent = false;
        for (let i = 0; i < dataBase.patternExp.length; i++) {
            let expRegexStr = '([\\\n])+' + dataBase.patternExp[i] + '([\\\n])+';
            let expRegex = new RegExp(expRegexStr, "gi");
            if (this.#extractedText.match(expRegex)) {
                console.log(this.#extractedText.match(expRegex)[0]);
                expPresent = true;
                break;
            }
        }
        if (expPresent) {
            forMatSuc.push("Experience is present");
        } else {
            forMatfail.push("Experience is missing");
            forMatScore -= 8;
        }

        let skillsPresent = false;
        for (let i = 0; i < dataBase.patternSkills.length; i++) {
            let skillsRegexStr = '([\\\n])+' + dataBase.patternSkills[i] + '([\\\n])+';
            let skillsRegex = new RegExp(skillsRegexStr, "gi");
            if (this.#extractedText.match(skillsRegex)) {
                console.log(this.#extractedText.match(skillsRegex)[0]);
                skillsPresent = true;
                break;
            }
        }
        if (skillsPresent) {
            forMatSuc.push("Skills are present");
        } else {
            forMatfail.push("Skills are missing");
            forMatScore -= 4;
        }
        let extraActPresent = false;
        for (let i = 0; i < dataBase.patternExtraAct.length; i++) {
            let extraActRegexStr = '([\\\n])+' + dataBase.patternExtraAct[i] + '([\\\n])+';
            let extraActRegex = new RegExp(extraActRegexStr, "gi");
            if (this.#extractedText.match(extraActRegex)) {
                console.log(this.#extractedText.match(extraActRegex)[0]);
                extraActPresent = true;
                break;
            }
        }
        if (extraActPresent) {
            forMatSuc.push("Extra Activities are present");
        } else {
            forMatfail.push("Extra Activities are missing");
            forMatScore -= 2;
        }

        // Check for Dates in the resume for foramting and and order

        // let currentSectionText = "";
        // let inOrder = true;
        // let currentSectionName = "";

        // for (let i = 0; i < extractedText.length; i++) {
        //     const section = extractedText[i].trim();

        //     if (section.startsWith('\n') && section.endsWith('\n')) {
        //         // new section detected
        //         if (currentSectionName !== "") {
        //             // check dates order in previous section
        //             const dates = currentSectionText.match(/(\d{1,2}\s*(th|st|nd|rd)?\s*(of)?\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?(\s*\d{2,4})?|\d{4}|\d{2}-\d{2})/g);

        //             const sortedDates = dates.map(date => {
        //                 const parsedDate = Date.parse(date);
        //                 return new Date(parsedDate);
        //             }).sort((a, b) => b - a);

        //             for (let j = 0; j < sortedDates.length; j++) {
        //                 if (currentSectionText.indexOf(sortedDates[j].toLocaleDateString()) < currentSectionText.indexOf(sortedDates[j + 1].toLocaleDateString())) {
        //                     inOrder = false;
        //                     break;
        //                 }
        //             }

        //             if (inOrder) {
        //                 formattingScore += 1;
        //                 feedback.push(`Dates in section "${currentSectionName}" are in chronological order.`);
        //             } else {
        //                 feedback.push(`Dates in section "${currentSectionName}" are not in chronological order.`);
        //             }
        //         }

        //         // start new section
        //         currentSectionName = section;
        //         currentSectionText = "";
        //         inOrder = true;
        //     } else {
        //         // append to current section text
        //         currentSectionText += section + "\n";
        //     }
        // }

        // // check dates order in the last section
        // const dates = currentSectionText.match(/(\d{1,2}\s*(th|st|nd|rd)?\s*(of)?\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?(\s*\d{2,4})?|\d{4}|\d{2}-\d{2})/g);

        // const sortedDates = dates.map(date => {
        //     const parsedDate = Date.parse(date);
        //     return new Date(parsedDate);
        // }).sort((a, b) => b - a);

        // console.log(sortedDates)

        // for (let j = 0; j < sortedDates.length - 1; j++) {
        //     if (currentSectionText.indexOf(sortedDates[j].toLocaleDateString()) < currentSectionText.indexOf(sortedDates[j + 1].toLocaleDateString())) {
        //         inOrder = false;
        //         break;
        //     }
        // }

        // if (inOrder) {
        //     forMatSuc.push(`Dates in section "${currentSectionName}" are in chronological order.`);
        // } else {
        //     forMatScore -= 5
        //     forMatfail.push(`Dates in section "${currentSectionName}" are not in chronological order.`);
        // }
        // add the total to running total and append jason object for feedback with success and fail
        this.#updateScore(forMatScore);
        this.#updateFeedback("Formatting", forMatSuc, forMatfail, forMatScore);
    }

    #getVocabScore() {
        let vocabScore = 20;
        let vocabSuc = [];
        let vocabfail = [];

        // Check for strong action words
        if (this.#extractedText.match(/[•‣⁃⁌⁍∙○●◘◦☙❥❧⦾⦿–][\n]*/g)) {
            let maxStrong = Math.round((this.#extractedText.match().length) * 0.85);
            let strongCount = 0;
            for (let i = 0; i < dataBase.strongActionWords.length; i++) {
                if (this.#extractedText.includes(dataBase.strongActionWords[i])) {
                    strongCount += 1;
                }
                if (strongCount == maxStrong) break;
            }
            if (strongCount == maxStrong) {
                vocabSuc.push("Sufficient Strong Action Words are present.");
            } else {
                vocabfail.push("Add more Strong Action Words to the bullet points.");
                vocabScore -= 8;
            }
        } else {
            vocabfail.push("Unable to process bullet points.");
        }

        // Check for buzzwords
        let maxBuzz = 7;
        let presentdWords = [];
        for (let i = 0; i < dataBase.strongActionWords; i++) {
            if (this.#extractedText.includes(dataBase.strongActionWords[i])) {
                presentdWords.push(dataBase.strongActionWords[i]);
            }
        }

        // Now for each word in Present words check if they are present more than 2 times every time you find one subtract 1 from maxBuzz and remove 1 from vocabScore
        for (let i = 0; i < presentdWords.length; i++) {
            if (
                this.#extractedText.match(
                    new RegExp(presentdWords[i], "g")
                ).length > 2
            ) {
                maxBuzz -= 1;
                vocabScore -= 1;
            }
        }

        if (maxBuzz == 0) {
            vocabfail.push("The following action words are repeated more than twice: " + presentdWords.join(", "));
        } else {
            vocabSuc.push("Good use of action words");
        }

        // Check for complex buzzwords
        let maxComplexBuzz = 5;
        for (
            let i = 0;
            i < dataBase.complexBuzzwords.length;
            i++ && maxComplexBuzz > 0
        ) {
            if (this.#extractedText.includes(dataBase.complexBuzzwords[i])) {
                maxComplexBuzz -= 1;
                vocabScore -= 1;
            }
        }

        if (maxComplexBuzz == 0) {
            vocabfail.push("Complex Buzzwords are present");
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
            brevityfail.push("Word Count is: " + words.length + ". Must be between 475 - 600 words.");
            brevityScore -= 8;
        }

        let extractedBulletPoints = this.#extractedText.split(/[•‣⁃⁌⁍∙○●◘◦☙❥❧⦾⦿–][\n]*/g);
        if (extractedBulletPoints.length > 1) {
            brevitySuc.push("Bullet points are used to convey information.");

            // Check Bullet Points word length - 5%
            // remove the first entry as bullet points start after the first index
            const bulletPoints = extractedBulletPoints.splice(1, extractedBulletPoints.length);
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
                brevityfail.push("Bullet Points must be less than 30 words.");
                brevityScore -= 5;
            } else {
                brevitySuc.push("Bullet Points are less than 30 words.");
            }

            // Check number of Bullet Points - 5%
            // 16 bullet points is a fair estimate 
            // 16 bullets x 15 words = 320 words (~70% of the minimum resume length)
            if (bulletPoints.length < 16) {
                brevityfail.push("Bullet Points are less than 16 in total.");
                brevityScore -= 5;
            } else {
                brevitySuc.push("More than 16 bullet points are present.");
            }
        } else {
            brevityfail.push("Unable to parse Bullet Points."); // -12%
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

        // Check for filler words
        let fillerWordsUsed = [];
        let maxFiller = 5;
        for (let i = 0; i < dataBase.fillerWords.length; i++) {
            if (this.#extractedText.includes(dataBase.fillerWords[i])) {
                fillerWordsUsed.push(dataBase.fillerWords[i]);
                maxFiller -= 1;
            }
        }

        if (maxFiller == 0 && dataBase.fillerWords.length > 0) {
            fillerfail.push(
                "Filler Words are present here is the list of words you can replace to increase your score: " +
                fillerWordsUsed.toString().replace(",", ", ")
            );
            fillerScore -= 10;
        } else {
            fillerSuc.push("Filler Words are not present");
        }
        // now check for overuse of filler words for every 2 filer words over 10,  1 point is deducted
        let fillerLimit = 10;
        if (fillerWordsUsed.length > 10) {
            for (let i = 0; i < fillerLimit.length; i++ && fillerLimit > 0) {
                fillerLimit -= 2;
                fillerScore -= 1;
            }
            fillerfail.push("Filler Words are overused");
        }

        // add the total to running total and append jason object for feedback with success and fail
        this.#updateScore(fillerScore);
        this.#updateFeedback("FillerWords", fillerSuc, fillerfail, fillerScore);
    }
};

// let extractedText = String.raw`Niravbhai Pandya\n \nEmail: niravpandya411@gmail.com\nLocation:Ontario, Canada\n \nMobile:\n \n709-687-4545\nE.I.T. (Engineer In Training)\n \nPEGNL Member\nLinkedIn: linkedin.com/in/nirav-pandya25\n\nEducation\n\n•\n \nMemorial University of Newfoundland\n \nSt. Johns, Canada\n\nMaster of Science - Oil and Gas Engineering\n \n01/2019 to 08/2020\n\nCourses:\n \nProduction, Safety Engineering, Phase Behavior, Reservoir, Drilling, Natural Gas, Reliability Engineering, Engineering\nEconomics\n\n•\n \nGujarat Technological University\n \nGujarat, India\n\nBachelor of Engineering - Process Engineering\n \n07/2012 to 06/2016\n\nCourses:\n \nMass Transfer, Chemical Reaction, Production Planning, Engineering Drawing/Graphics, Thermodynamics, Advance Safety,\nEngineering Planning and Execution\n\nSkills Summary\n\n•\n \nSoft Skill\n:\n \nLeadership, Public Speaking, Problem-Solving, Analytical Thinking, Cross Discipline Contribution and\nTeamwork, Competitive\n\n•\n \nTechnical Skills\n:\n \nProject Management, Project Planning, Project & Controls, Operations Management, SAP,\nAutoCAD/CAD, HAZOP Studies, P&ID Preparation and Modifications, ECLIPESE, KAPPA PVT Simulation, CMG\nSoftware, SAP & Single View Programming, Six Sigma, KPI, Process Improvement, Production, MATLAB\n\nExperience\n\n•\n \nInmarsat\n \nSt. Johns, NL\n\nBilling Dispute Analyst\n \n09/2021 to Present\n\n◦\n \nBilling Disputes Resolution\n: Investigating and resolving complex billing disputes through thorough research and\nanalysis of customer records.\n\n◦\n \nPost-Resolution Checks\n: Conducting post-resolution checks to ensure accuracy and customer satisfaction.\n\n◦\n \nSAP Utilization\n: UUtilizing SAP to summarize and simplify complex  dataBase for senior management and presenting\neffective solutions.\n\n◦\n \nTrend Analysis\n: Identifying and analyzing recurring billing errors through trend analysis, in order to implement\npreventative measures.\n\n•\n \nBurger King\n \nSt. Johns, NL\n\nAssistant Manager\n \n07/2020 to 08/2021\n\n◦\n \nPlanning Tasks & Scheduling\n: Managed daily operations and ensured smooth functioning of the store by efficiently\nplanning tasks and scheduling employees.\n\n◦\n \nPerformance Reviews\n: Improved employee performance by conducting regular performance evaluations, identifying\nareas of improvement and implementing incentives and promotions.\n\n◦\n \nSafety and Best Food Handling Practices\n: Ensured compliance with government and corporate guidelines for food\nsafety and handling practices to ensure maximum customer satisfaction and a safe work environment.\n\n•\n \nGujarat Fluorochemicals Limited\n \nBharuch, India\n\nProduction Engineer\n \n11/2017 to 05/2018\n\n◦\n \nAnalysis and Prevention\n: Conducted root cause analysis to identify and implement effective and long-term corrective\nactions, and documented faults for future prevention.\n\n◦\n \nPlant Operation and Reporting\n: Troubleshooted and resolved day-to-day operational issues and compiled monthly\nreports for senior management review.\n\n◦\n \nHAZOP Studies and Safe Work Planning\n: Actively participated in regular plant-wide HAZOP studies and\ndeveloped, implemented and distributed safe work procedures for technicians and workers.\n\n◦\n \nCross Discipline Collaboration\n: Collaborated with cross-functional teams to provide input on process improvements\nto increase production while maintaining quality standards.\n\n•\n \nLupin Limited\n \nVadodara, India\n\nProcess Engineer\n \n08/2016 to 11/2017\n\n◦\n \nTechnology Transfer Documentation\n: Led technology transfer documentation efforts, including volume calculations,\nstandard operating procedure (SOP) development, TRT calculation, capacity calculations, utility calculations, feasibility\nanalysis, and PFD creation/modification.\n\n◦\n \nPlant Unit Operation\n: Managed day-to-day operations of various plant units, including distillation, evaporator,\ncentrifuge, and dryer.\n\n◦\n \nInvestment Analysis and Planning\n: Conducted cost-benefit analyses and planned for new equipment and plant\nexpansions.\n\n◦\n \nConstructive Input and Reporting\n: Provided regular, constructive input to plant manager and operations lead on\nareas for improvement, and reported on progress and performance.Certifications\n\n•\n \nEngineer in Training (EIT)\n: PEGNL, Newfoundland, Canada 06/21\n\n•\n \nFirst Aid at Work\n: Green World Group 02/21\n\n•\n \nISO 45001:2018 Internal Auditor Awareness\n: Green World Group 02/21\n\n•\n \nDisaster Management with Advanced Emergency Response Principles\n \n: CPD Standards Office 02/21\n\n•\n \nEssential Fire and Safety Principles\n: Green World Group 02/21\n\n•\n \nGMP-Good Manufacturing Practices\n: Udemy\n\n•\n \nLean Six Sigma\n: Project Management Institute (PIMA) 05/21`;

// let testingJobDescription = String.raw`Key Responsibilities\n• Execute technical feasibility studies, conceptual design, and process design and studies.\n• Act as Process lead on projects\n• Assist in the development and review of all the standard process engineering deliverables like design basis, process design criteria, HMB, PFDs and P&IDs among various others.\n• Develop/Review process simulations (HYSYS and other process simulators) and heat/material balance.\n• Review of vendor equipment quotes, drawings etc.\n• Collaborate with project team to achieve project objectives. Interface with other departments, project managers, engineers, clients, and vendors during all phases of projects to ensure a good working interface.\n• Participate in studies for various climate change and decarbonization related engagements, to support our clients’ sustainability objectives.\n• Lead and participate in client engagements and projects with a focus on hydrogen and climate change\n• Be a champion of inclusion and diversity\n\nSkills And Experience\n• Professional designation (P.Eng.) or eligible for registration with PEGNL.\n• 15+ years of experience.\n• A keen interest in emission reductions, energy transition and willingness to expand expertise is a must.\n• Any experience in the area of hydrogen design/operations is an asset.\n• Process design experience including standard process deliverables P&IDs, cause and effect diagrams, hazard and operability design reviews and systems support services.\n• Experience with technical studies, FEED and systems design experience including piping and instrument diagrams, cause and effect diagrams, hazard and operability design reviews and systems support services.\n• Working knowledge of detailed design project (EPC and EPCM) execution for oil & gas, chemical and/or power industry clients.\n• Knowledge of federal/provincial safety policies and procedures along with general understanding of International and Canadian codes and standards.\n• Personal Qualities. We are looking for applicants who can demonstrate:\n• Ability to work in a multi-discipline team to develop solutions focused on client objectives,\n• Must be able to prioritize workload and meet deadlines.\n• Excellent interpersonal communication and commercial skills,\n• Enthusiasm for facilities engineering and the desire to develop their abilities in study and project management\n• Proven client relationship management and business development skills.\n• Experience in managing and executing feasibility studies, FEED, and EPCM engagements.`;

// testingResumeScore = new resumechecker(extractedText, testingJobDescription)

// totalScoreReceived = testingResumeScore.getResult()

// console.log(totalScoreReceived.matchFeedback)
// console.log(totalScoreReceived.matchScore)

// console.log(totalScoreReceived.Totalscore)


// // Constructor takes in the extracted text from the pdf and Job Description compares them and gives the code in JSON Object.