// This function will take the extratced text from the pdf and check it against the keywords
// Input: extractedText
// Output: score
// Feedback: feedback on each section

const { escape } = require('querystring');
var  dataBase = require('./data.json');



module.exports = class resumechecker {
 
    constructor (extractedText) {
        this.extractedText = extractedText
        this.feedBack = {Formatting: {Success: [], Fail: [], Score: []}, Vocabulary: {Success: [], Fail: [], Score: []}, Brevity: {Success: [], Fail: [], Score: []}, FillerWords: {Success: [], Fail: [], Score: []}, TotalScore: 0}     
        this.totalScore = 0
           
    } ; // Constructor takes in the extracted text from the pdf


    updateScore(score) {
        this.totalScore += score
        return this.totalScore
    }

    updateFeedback(section, success, fail, score) {
        if (section == "Formatting") {
            for (let i = 0; i < success.length; i++) {
                this.feedBack.Formatting.Success.push(success[i])
            }
            for (let i = 0; i < fail.length; i++) {
                this.feedBack.Formatting.Fail.push(fail[i])
            }
            this.feedBack.Formatting.Score.push(score)
        } else if (section == "Vocabulary") {
            for (let i = 0; i < success.length; i++) {
                this.feedBack.Vocabulary.Success.push(success[i])
            }
            for (let i = 0; i < fail.length; i++) {
                this.feedBack.Vocabulary.Fail.push(fail[i])
            }
            this.feedBack.Vocabulary.Score.push(score)
        }
        else if (section == "Brevity") {
            for (let i = 0; i < success.length; i++) {
                this.feedBack.Brevity.Success.push(success[i])
            }
            for (let i = 0; i < fail.length; i++) {
                this.feedBack.Brevity.Fail.push(fail[i])
            }
            this.feedBack.Brevity.Score.push(score)
        }
        else if (section == "FillerWords") {
            for (let i = 0; i < success.length; i++) {
                this.feedBack.FillerWords.Success.push(success[i])
            }
            for (let i = 0; i < fail.length; i++) {
                this.feedBack.FillerWords.Fail.push(fail[i])
            }
            this.feedBack.FillerWords.Score.push(score)
        }
    }   

    getResult() {
        this.getFormattingScore()
        this.getVocabScore()
        this.getBrevityScore()
        this.getFillerScore()
        this.feedBack.TotalScore = this.totalScore

        return this.feedBack
    }


    getFormattingScore() {
        let forMatScore = 40  // Total score for formatting
        let forMatSuc = [] // Array of successful formatting
        let forMatFail = []  // Array of failed formatting

        // Check for email, phone number, and linkedin
        const emailRegex = /(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi;
        const phoneRegex = /(\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4})/gi;
        if (this.extractedText.match(emailRegex)) {
            forMatSuc.push("Email Address is: " + this.extractedText.match(emailRegex))
        } else {
            forMatFail.push("Email Address is missing")
            forMatScore -= 5  // Added 1 for Date
        }
        if (this.extractedText.match(phoneRegex)) {
            forMatSuc.push("Phone Number is: " + this.extractedText.match(phoneRegex))
        } else {
            forMatFail.push("Phone Number is missing")
            forMatScore -= 5 // Added 1 for Date
        }
        if (this.extractedText.includes("LinkedIn")) {
            forMatSuc.push("LinkedIn is present")
        } else {
            forMatFail.push("LinkedIn is missing")
            forMatScore -= 5 // Added 3 for Date
        }
        // Check for section headings and add to score
            let educPresent = false
        for (let i = 0; i <  dataBase.patternEduc.length; i++) {
            if (this.extractedText.includes(dataBase.patternEduc[i])) {
                educPresent = true
                break
            }   
        }
        if (educPresent) {
            forMatSuc.push("Education is present")
        } else {
            forMatFail.push("Education is missing")
            forMatScore -= 8
        }

        let expPresent = false
        for (let i = 0; i <  dataBase.patternExp.length; i++) {
            if (this.extractedText.includes(dataBase.patternExp[i])) {
                expPresent = true
                break
            }
        }
        if (expPresent) {
            forMatSuc.push("Experience is present")
        } else {
            forMatFail.push("Experience is missing")
            forMatScore -= 8
        }

        let skillsPresent = false
        for (let i = 0; i <  dataBase.patternSkills.length; i++) {
            if (this.extractedText.match(dataBase.patternSkills[i])) {
                skillsPresent = true
                break
            }
        }
        if (skillsPresent) {
            forMatSuc.push("Skills are present")
        } else {
            forMatFail.push("Skills are missing")
            forMatScore -= 4
        }
        let extraActPresent = false
        for (let i = 0; i <  dataBase.patternExtraAct.length; i++) {
            if (this.extractedText.includes(dataBase.patternExtraAct[i])) {
                extraActPresent = true
                break
            }
        }
        if (extraActPresent) {
            forMatSuc.push("Extra Activities are present")
        } else {
            forMatFail.push("Extra Activities are missing")
            forMatScore -= 2
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
        //     forMatFail.push(`Dates in section "${currentSectionName}" are not in chronological order.`);
        // }
        // add the total to running total and append jason object for feedback with success and fail
        this.updateScore(forMatScore)
        this.updateFeedback("Formatting", forMatSuc, forMatFail, forMatScore)
    }

    getVocabScore() {
        let vocabScore = 20
        let vocabSuc = []
        let vocabFail = []

        // Check for strong action words
        let maxStrong = 0
        for (let i = 0; i <  dataBase.strongActionWords.length; i++ && maxStrong != 8) {
            if (this.extractedText.includes(dataBase.strongActionWords[i])) {
                maxStrong += 1
            }
        }

        if (maxStrong == 4) {
            vocabSuc.push("Strong Action Words are present")
        } else {
            vocabFail.push("Strong Action Words are missing")
            vocabScore -= 8
        }
        // Check for buzzwords
        let maxBuzz = 7
        for (let i = 0; i <  dataBase.buzzWords.length; i++ && maxBuzz > 0) {
            if (this.extractedText.includes(dataBase.buzzWords[i])) {
                maxBuzz -= 1
                vocabScore -= 1
            }
        }

        if (maxBuzz == 0) {
            vocabFail.push("Buzzwords are present")
        }
        else
        {
            vocabSuc.push("Buzzwords are missing")
        }

        // Check for complex buzzwords
        const maxComplexBuzz = 5
        for (let i = 0; i <  dataBase.complexBuzzwords.length; i++ && maxComplexBuzz > 0) {
            if (this.extractedText.includes(dataBase.complexBuzzwords[i])) {
                maxComplexBuzz -= 1
                vocabScore -= 1
            }
        }

        if (maxComplexBuzz == 0) {
            vocabFail.push("Complex Buzzwords are present")
        }
        else
        {
            vocabSuc.push("Complex Buzzwords are missing")
        }


        // add the total to running total and append jason object for feedback with success and fail
        this.updateScore(vocabScore)
        this.updateFeedback("Vocabulary", vocabSuc, vocabFail, vocabScore)
    }

    getBrevityScore() {
        let brevityScore = 20
        let brevitySuc = []
        let brevityFail = []

        // Check for word count
        const words = this.extractedText.split(" ")
          

        if (words.length > 400) {
            brevitySuc.push("Word Count is greater than 400")
        } else {
            brevityFail.push("Word Count is less than 400")
            brevityScore -= 8
        }

        // check each bullet point in the extrected text for word count the
        const bulletPoints = this.extractedText.split(/-|\+|=|•|\*/)
        const maxLengthBullet = 30
        let maxpoint = 5
        for (let i = 0; i < bulletPoints.length; i++ && maxpoint > 0) {
            if (bulletPoints[i].length > maxLengthBullet) {
                maxpoint -= 1
            }
        }

        if (maxpoint == 0) {
            brevityFail.push("Bullet Points are too long.")
            brevityScore -= 2
        }

        if (bulletPoints.length < 16) {
            brevityFail.push("Bullet Points are less than 16 in total.")
            brevityScore -= 3
        }
        else {
            brevitySuc.push("Bullet Points are greater than 16 in total.")

        }

        // paragraph presense check
        const paragraphs = this.extractedText.split(/(\r\n|\n\n|\r|\p)/gm)
        const maxParagraphs = 25 // 15 paragraphs
        let paragraphLen = 0
        for (let i = 0; i < paragraphs.length; i++) {
            if (paragraphs[i].length > 30) {
                paragraphLen += 1
            }
        }
        if (paragraphLen > maxParagraphs) {
            brevityFail.push("Presense of too many paragraphs")
            brevityScore -= 7
        }
        else {
            brevitySuc.push("Presense of enough paragraphs")
        }

        // add the total to running total and append jason object for feedback with success and fail
        this.updateScore(brevityScore)
        this.updateFeedback("Brevity", brevitySuc, brevityFail, brevityScore)
    }

    getFillerScore() {
        let fillerScore = 20
        let fillerSuc = []
        let fillerFail = []

        // Check for filler words
        let fillerWordsUsed = []
        let maxFiller = 5
        for (let i = 0; i <  dataBase.fillerWords.length; i++) {
            if (this.extractedText.includes(dataBase.fillerWords[i])) {
                fillerWordsUsed.push(dataBase.fillerWords[i])
                maxFiller -= 1
            }
        }

        if (maxFiller == 0 &&  dataBase.fillerWords.length > 0) {
            fillerFail.push("Filler Words are present here is the list of words you can replace to increase your score: " + fillerWordsUsed)
            fillerScore -= 10
        }

        if (fillerWordsUsed.length == 0) {
            fillerSuc.push("Filler Words are not present")
        }

        // now check for overuse of filler words for every 2 filer words over 10,  1 point is deducted
        let fillerLimit = 10
        if (fillerWordsUsed.length > 10) {
            for (let i = 0; i < fillerLimit.length; i++ && fillerLimit > 0) {
                fillerLimit -= 2
                fillerScore -= 1
            }
            fillerFail.push("Filler Words are overused")
        }

        // add the total to running total and append jason object for feedback with success and fail
        this.updateScore(fillerScore)
        this.updateFeedback("FillerWords", fillerSuc, fillerFail, fillerScore)
    }
}

// extractedText = String.raw`Niravbhai Pandya\n \nEmail: niravpandya411@gmail.com\nLocation:Ontario, Canada\n \nMobile:\n \n709-687-4545\nE.I.T. (Engineer In Training)\n \nPEGNL Member\nLinkedIn: linkedin.com/in/nirav-pandya25\n\nEducation\n\n•\n \nMemorial University of Newfoundland\n \nSt. Johns, Canada\n\nMaster of Science - Oil and Gas Engineering\n \n01/2019 to 08/2020\n\nCourses:\n \nProduction, Safety Engineering, Phase Behavior, Reservoir, Drilling, Natural Gas, Reliability Engineering, Engineering\nEconomics\n\n•\n \nGujarat Technological University\n \nGujarat, India\n\nBachelor of Engineering - Process Engineering\n \n07/2012 to 06/2016\n\nCourses:\n \nMass Transfer, Chemical Reaction, Production Planning, Engineering Drawing/Graphics, Thermodynamics, Advance Safety,\nEngineering Planning and Execution\n\nSkills Summary\n\n•\n \nSoft Skill\n:\n \nLeadership, Public Speaking, Problem-Solving, Analytical Thinking, Cross Discipline Contribution and\nTeamwork, Competitive\n\n•\n \nTechnical Skills\n:\n \nProject Management, Project Planning, Project & Controls, Operations Management, SAP,\nAutoCAD/CAD, HAZOP Studies, P&ID Preparation and Modifications, ECLIPESE, KAPPA PVT Simulation, CMG\nSoftware, SAP & Single View Programming, Six Sigma, KPI, Process Improvement, Production, MATLAB\n\nExperience\n\n•\n \nInmarsat\n \nSt. Johns, NL\n\nBilling Dispute Analyst\n \n09/2021 to Present\n\n◦\n \nBilling Disputes Resolution\n: Investigating and resolving complex billing disputes through thorough research and\nanalysis of customer records.\n\n◦\n \nPost-Resolution Checks\n: Conducting post-resolution checks to ensure accuracy and customer satisfaction.\n\n◦\n \nSAP Utilization\n: UUtilizing SAP to summarize and simplify complex  dataBase for senior management and presenting\neffective solutions.\n\n◦\n \nTrend Analysis\n: Identifying and analyzing recurring billing errors through trend analysis, in order to implement\npreventative measures.\n\n•\n \nBurger King\n \nSt. Johns, NL\n\nAssistant Manager\n \n07/2020 to 08/2021\n\n◦\n \nPlanning Tasks & Scheduling\n: Managed daily operations and ensured smooth functioning of the store by efficiently\nplanning tasks and scheduling employees.\n\n◦\n \nPerformance Reviews\n: Improved employee performance by conducting regular performance evaluations, identifying\nareas of improvement and implementing incentives and promotions.\n\n◦\n \nSafety and Best Food Handling Practices\n: Ensured compliance with government and corporate guidelines for food\nsafety and handling practices to ensure maximum customer satisfaction and a safe work environment.\n\n•\n \nGujarat Fluorochemicals Limited\n \nBharuch, India\n\nProduction Engineer\n \n11/2017 to 05/2018\n\n◦\n \nAnalysis and Prevention\n: Conducted root cause analysis to identify and implement effective and long-term corrective\nactions, and documented faults for future prevention.\n\n◦\n \nPlant Operation and Reporting\n: Troubleshooted and resolved day-to-day operational issues and compiled monthly\nreports for senior management review.\n\n◦\n \nHAZOP Studies and Safe Work Planning\n: Actively participated in regular plant-wide HAZOP studies and\ndeveloped, implemented and distributed safe work procedures for technicians and workers.\n\n◦\n \nCross Discipline Collaboration\n: Collaborated with cross-functional teams to provide input on process improvements\nto increase production while maintaining quality standards.\n\n•\n \nLupin Limited\n \nVadodara, India\n\nProcess Engineer\n \n08/2016 to 11/2017\n\n◦\n \nTechnology Transfer Documentation\n: Led technology transfer documentation efforts, including volume calculations,\nstandard operating procedure (SOP) development, TRT calculation, capacity calculations, utility calculations, feasibility\nanalysis, and PFD creation/modification.\n\n◦\n \nPlant Unit Operation\n: Managed day-to-day operations of various plant units, including distillation, evaporator,\ncentrifuge, and dryer.\n\n◦\n \nInvestment Analysis and Planning\n: Conducted cost-benefit analyses and planned for new equipment and plant\nexpansions.\n\n◦\n \nConstructive Input and Reporting\n: Provided regular, constructive input to plant manager and operations lead on\nareas for improvement, and reported on progress and performance.Certifications\n\n•\n \nEngineer in Training (EIT)\n: PEGNL, Newfoundland, Canada 06/21\n\n•\n \nFirst Aid at Work\n: Green World Group 02/21\n\n•\n \nISO 45001:2018 Internal Auditor Awareness\n: Green World Group 02/21\n\n•\n \nDisaster Management with Advanced Emergency Response Principles\n \n: CPD Standards Office 02/21\n\n•\n \nEssential Fire and Safety Principles\n: Green World Group 02/21\n\n•\n \nGMP-Good Manufacturing Practices\n: Udemy\n\n•\n \nLean Six Sigma\n: Project Management Institute (PIMA) 05/21`;

// testingResumeScore = new resumechecker(extractedText)

// totalScoreReceived = testingResumeScore.getResult()

// console.log(totalScoreReceived.TotalScore)


          

        
        