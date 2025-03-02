class QuestionGenerator {
    constructor(pdfData) {
        this.pdfData = pdfData;
        this.askedQuestions = new Set();
        this.currentQuestion = null;
        this.topics = [
            "מבוא לביולוגיה", "מבוא לכימיה", "מבוא לביוכימיה", "תאים אאוקריוטים ופרוקריוטים",
            "שלד התא", "מים כממס", "ממברנות", "טרנספרים", "אנרגיה", "DNA לחלבון",
            "ביטוי גנים ומוטציות", "מחלות גנטיות", "ביטוי גנים דיפרנציאלי", "הנדסה גנטית"
        ];
    }

    generateUniqueQuestion() {
        let attempts = 0;
        let question;

        while (attempts < 10) {
            question = this.generateCrossTopicQuestion();
            const questionId = this.getQuestionId(question);
            if (!this.askedQuestions.has(questionId)) {
                this.askedQuestions.add(questionId);
                this.currentQuestion = question;
                return question;
            }
            attempts++;
        }

        throw new Error('לא ניתן ליצור שאלה ייחודית חדשה');
    }

    getQuestionId(question) {
        return `${question.questionText}|${question.correctAnswer}`;
    }

    generateCrossTopicQuestion() {
        const source1Type = Math.random() < 0.5 ? 'presentations' : 'summaries';
        const source2Type = source1Type === 'presentations' ? 'summaries' : 'presentations';
        
        const source1Keys = Object.keys(this.pdfData[source1Type]);
        const source2Keys = Object.keys(this.pdfData[source2Type]);
        
        const source1Name = source1Keys[Math.floor(Math.random() * source1Keys.length)];
        const source2Name = source2Keys[Math.floor(Math.random() * source2Keys.length)];
        
        const source1Data = this.pdfData[source1Type][source1Name];
        const source2Data = this.pdfData[source2Type][source2Name];
        
        const para1 = source1Data.paragraphs[Math.floor(Math.random() * source1Data.paragraphs.length)];
        const para2 = source2Data.paragraphs[Math.floor(Math.random() * source2Data.paragraphs.length)];

        const term1 = this.extractSignificantTerm(para1);
        const term2 = this.extractSignificantTerm(para2);
        
        const topic1 = this.topics[Math.floor(Math.random() * this.topics.length)];
        const topic2 = this.topics.filter(t => t !== topic1)[Math.floor(Math.random() * (this.topics.length - 1))];
        
        const questionText = `כיצד ${term1} מתוך ${topic1} (${source1Name}) משפיע על ${term2} בתהליך הקשור ל-${topic2} (${source2Name})?`;
        const correctAnswer = `${term1} משפיע על ${term2} דרך תהליך ביולוגי המשלב את ${topic1} ו-${topic2}.`;
        const options = [
            correctAnswer,
            `${term1} אינו משפיע על ${term2} כלל.`,
            `${term2} הוא הגורם העיקרי שמשפיע על ${term1}.`,
            `שניהם לא קשורים ל-${topic1} או ל-${topic2}.`
        ];

        return {
            questionText,
            options: this.shuffleArray(options),
            correctAnswer,
            explanation: `התשובה מבוססת על הקשר בין ${term1} ל-${term2} דרך ${topic1} ו-${topic2}: ${correctAnswer}`,
            difficulty: 10
        };
    }

    extractSignificantTerm(paragraph) {
        const words = paragraph.split(/\s+/);
        const significantWords = words.filter(word => 
            word.length > 4 && !['את', 'של', 'הוא', 'היא', 'אני', 'הם', 'אבל', 'לכן', 'כאשר'].includes(word)
        );
        return significantWords.length > 0 ? significantWords[Math.floor(Math.random() * significantWords.length)] : "מושג";
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    checkAnswer(userAnswer) {
        if (!this.currentQuestion) throw new Error('אין שאלה נוכחית לבדיקה');
        const isCorrect = userAnswer === this.currentQuestion.correctAnswer;
        return {
            isCorrect,
            correctAnswer: this.currentQuestion.correctAnswer,
            explanation: this.currentQuestion.explanation
        };
    }
}