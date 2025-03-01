// מחלקה לייצור שאלות אמריקאיות
class QuestionGenerator {
    constructor(pdfData) {
        this.pdfData = pdfData;
        this.askedQuestions = new Set(); // מעקב אחר שאלות שכבר נשאלו
        this.currentQuestion = null;
    }
    
    // יצירת שאלה חדשה
    generateQuestion() {
        // בחירה אקראית אם לקחת מידע ממצגת או מסיכום
        const sourceType = Math.random() < 0.8 ? 'presentations' : 'summaries';
        
        // מקורות המידע הזמינים
        const availableSources = Object.keys(this.pdfData[sourceType]);
        if (availableSources.length === 0) {
            throw new Error('אין מספיק מידע ליצירת שאלות');
        }
        
        // בחירה אקראית של מקור מידע
        const sourceIndex = Math.floor(Math.random() * availableSources.length);
        const sourceName = availableSources[sourceIndex];
        const sourceData = this.pdfData[sourceType][sourceName];
        
        // בחירה אקראית של פסקה מתוך המקור
        const paragraphs = sourceData.paragraphs;
        if (paragraphs.length === 0) {
            // ננסה מקור אחר אם אין מספיק פסקאות
            return this.generateQuestion();
        }
        
        const paragraphIndex = Math.floor(Math.random() * paragraphs.length);
        const paragraph = paragraphs[paragraphIndex];
        
        // יצירת השאלה
        return this.createQuestion(paragraph, sourceType, sourceName);
    }
    
    // יצירת שאלה חדשה שעדיין לא נשאלה
    generateUniqueQuestion() {
        let attempts = 0;
        let question;
        
        // ננסה ליצור שאלה חדשה עד 10 פעמים
        while (attempts < 10) {
            question = this.generateQuestion();
            // יצירת מזהה ייחודי לשאלה
            const questionId = this.getQuestionId(question);
            
            // בדיקה אם השאלה כבר נשאלה
            if (!this.askedQuestions.has(questionId)) {
                this.askedQuestions.add(questionId);
                this.currentQuestion = question;
                return question;
            }
            
            attempts++;
        }
        
        // אם לא הצלחנו ליצור שאלה ייחודית, ננסה להחליף רק את המסיחים
        if (question) {
            question.options = this.generateOptions(question.correctAnswer);
            const questionId = this.getQuestionId(question);
            this.askedQuestions.add(questionId);
            this.currentQuestion = question;
            return question;
        }
        
        throw new Error('לא ניתן ליצור שאלה ייחודית חדשה');
    }
    
    // יצירת מזהה ייחודי לשאלה
    getQuestionId(question) {
        return `${question.questionText}|${question.correctAnswer}`;
    }
    
    // יצירת שאלה על בסיס פסקה מסוימת
    createQuestion(paragraph, sourceType, sourceName) {
        // שיטות שונות ליצירת שאלות
        const questionTypes = [
            this.createDefinitionQuestion,
            this.createRelationshipQuestion,
            this.createProcessQuestion,
            this.createComparisonQuestion,
            this.createAnalysisQuestion
        ];
        
        // בחירה אקראית של סוג שאלה
        const questionTypeIndex = Math.floor(Math.random() * questionTypes.length);
        const createQuestionFunc = questionTypes[questionTypeIndex].bind(this);
        
        try {
            return createQuestionFunc(paragraph, sourceType, sourceName);
        } catch (error) {
            // אם נכשל, ננסה ליצור שאלת הגדרה פשוטה יותר
            console.warn('שגיאה ביצירת שאלה מורכבת:', error);
            return this.createDefinitionQuestion(paragraph, sourceType, sourceName);
        }
    }
    
    // יצירת שאלת הגדרה
    createDefinitionQuestion(paragraph, sourceType, sourceName) {
        // חיפוש מושגים מרכזיים בפסקה
        const words = paragraph.split(/\s+/);
        const significantWords = words.filter(word => 
            word.length > 4 && 
            !['את', 'של', 'הוא', 'היא', 'אני', 'הם', 'אבל', 'לכן', 'כאשר'].includes(word)
        );
        
        if (significantWords.length === 0) {
            throw new Error('לא נמצאו מילים משמעותיות בפסקה');
        }
        
        // בחירת מושג אקראי מהפסקה
        const wordIndex = Math.floor(Math.random() * significantWords.length);
        const targetWord = significantWords[wordIndex];
        
        // יצירת טקסט השאלה
        const questionText = `מהי ההגדרה הנכונה ביותר ל${targetWord}?`;
        
        // התשובה הנכונה היא הפסקה עצמה או חלק ממנה
        const correctAnswer = paragraph;
        
        // יצירת מסיחים על ידי בחירת פסקאות אקראיות אחרות
        const options = this.generateOptions(correctAnswer);
        
        return {
            questionText,
            options,
            correctAnswer,
            explanation: `התשובה הנכונה היא: ${correctAnswer}. מקור: ${sourceType === 'presentations' ? 'מצגת' : 'סיכום'} ${sourceName}.`,
            difficulty: 10
        };
    }
    
    // יצירת שאלה על קשרים בין מושגים
    createRelationshipQuestion(paragraph, sourceType, sourceName) {
        // חיפוש שני מושגים מרכזיים בפסקה
        const words = paragraph.split(/\s+/);
        const significantWords = words.filter(word => 
            word.length > 4 && 
            !['את', 'של', 'הוא', 'היא', 'אני', 'הם', 'אבל', 'לכן', 'כאשר'].includes(word)
        );
        
        if (significantWords.length < 2) {
            throw new Error('לא נמצאו מספיק מילים משמעותיות בפסקה');
        }
        
        // בחירת שני מושגים שונים מהפסקה
        let term1Index = Math.floor(Math.random() * significantWords.length);
        let term2Index;
        do {
            term2Index = Math.floor(Math.random() * significantWords.length);
        } while (term1Index === term2Index);
        
        const term1 = significantWords[term1Index];
        const term2 = significantWords[term2Index];
        
        // יצירת טקסט השאלה
        const questionText = `מהו הקשר הנכון בין ${term1} ל${term2}?`;
        
        // התשובה הנכונה היא הפסקה עצמה
        const correctAnswer = paragraph;
        
        // יצירת מסיחים
        const options = this.generateOptions(correctAnswer);
        
        return {
            questionText,
            options,
            correctAnswer,
            explanation: `התשובה הנכונה מתארת את הקשר בין ${term1} ל${term2}: ${correctAnswer}. מקור: ${sourceType === 'presentations' ? 'מצגת' : 'סיכום'} ${sourceName}.`,
            difficulty: 10
        };
    }
    
    // יצירת שאלה על תהליך
    createProcessQuestion(paragraph, sourceType, sourceName) {
        // בדיקה אם הפסקה מתארת תהליך
        const processIndicators = ['תהליך', 'שלבים', 'ראשית', 'לאחר מכן', 'לבסוף', 'כתוצאה'];
        const isProcessDescription = processIndicators.some(indicator => paragraph.includes(indicator));
        
        if (!isProcessDescription) {
            throw new Error('הפסקה אינה מתארת תהליך');
        }
        
        // יצירת טקסט השאלה
        const questionText = `איזה מהמשפטים הבאים מתאר נכון את התהליך המתואר בפסקה הבאה?`;
        
        // התשובה הנכונה היא הפסקה עצמה
        const correctAnswer = paragraph;
        
        // יצירת מסיחים
        const options = this.generateOptions(correctAnswer);
        
        return {
            questionText,
            options,
            correctAnswer,
            explanation: `התשובה הנכונה מתארת את התהליך כך: ${correctAnswer}. מקור: ${sourceType === 'presentations' ? 'מצגת' : 'סיכום'} ${sourceName}.`,
            difficulty: 10
        };
    }
    
    // יצירת שאלת השוואה
    createComparisonQuestion(paragraph, sourceType, sourceName) {
        // חיפוש מילות השוואה בפסקה
        const comparisonIndicators = ['בהשוואה ל', 'לעומת', 'בניגוד ל', 'דומה ל', 'שונה מ'];
        let hasComparison = false;
        let comparisonTerms = [];
        
        for (const indicator of comparisonIndicators) {
            if (paragraph.includes(indicator)) {
                hasComparison = true;
                // ניסיון לחלץ את המושגים המושווים
                const parts = paragraph.split(indicator);
                if (parts.length > 1) {
                    const beforeTerm = parts[0].split(' ').slice(-1)[0];
                    const afterTerm = parts[1].split(' ')[0];
                    comparisonTerms = [beforeTerm, afterTerm];
                    break;
                }
            }
        }
        
        if (!hasComparison) {
            throw new Error('הפסקה אינה מכילה השוואה');
        }
        
        // יצירת טקסט השאלה
        let questionText;
        if (comparisonTerms.length === 2) {
            questionText = `מהו ההבדל העיקרי בין ${comparisonTerms[0]} ל${comparisonTerms[1]}?`;
        } else {
            questionText = `איזו מההשוואות הבאות היא הנכונה ביותר?`;
        }
        
        // התשובה הנכונה היא הפסקה עצמה
        const correctAnswer = paragraph;
        
        // יצירת מסיחים
        const options = this.generateOptions(correctAnswer);
        
        return {
            questionText,
            options,
            correctAnswer,
            explanation: `התשובה הנכונה מתארת את ההשוואה כך: ${correctAnswer}. מקור: ${sourceType === 'presentations' ? 'מצגת' : 'סיכום'} ${sourceName}.`,
            difficulty: 10
        };
    }
    
    // יצירת שאלת ניתוח
    createAnalysisQuestion(paragraph, sourceType, sourceName) {
        // יצירת טקסט השאלה
        const questionText = `על פי הטקסט הבא, מהי המסקנה המדויקת ביותר?

"${paragraph}"`;
        
        // נייצר תשובה נכונה שהיא מסקנה הגיונית מהפסקה
        // במקרה זה, נשתמש בפסקה עצמה כדי להימנע מהכללות שגויות
        const correctAnswer = `המסקנה המדויקת היא: ${paragraph}`;
        
        // יצירת מסיחים
        const options = this.generateOptions(correctAnswer);
        
        return {
            questionText,
            options,
            correctAnswer,
            explanation: `התשובה הנכונה היא: ${correctAnswer}. מקור: ${sourceType === 'presentations' ? 'מצגת' : 'סיכום'} ${sourceName}.`,
            difficulty: 10
        };
    }
    
    // יצירת מסיחים
    generateOptions(correctAnswer) {
        const options = [correctAnswer];
        
        // יצירת 3 מסיחים שגויים
        for (let i = 0; i < 3; i++) {
            // בחירה אקראית אם לקחת מידע ממצגת או מסיכום
            const sourceType = Math.random() < 0.5 ? 'presentations' : 'summaries';
            
            // מקורות המידע הזמינים
            const availableSources = Object.keys(this.pdfData[sourceType]);
            if (availableSources.length === 0) continue;
            
            // בחירה אקראית של מקור מידע
            const sourceIndex = Math.floor(Math.random() * availableSources.length);
            const sourceName = availableSources[sourceIndex];
            const sourceData = this.pdfData[sourceType][sourceName];
            
            // בחירה אקראית של פסקה מתוך המקור
            const paragraphs = sourceData.paragraphs;
            if (paragraphs.length === 0) continue;
            
            const paragraphIndex = Math.floor(Math.random() * paragraphs.length);
            const paragraph = paragraphs[paragraphIndex];
            
            // בדיקה שהמסיח שונה מהתשובה הנכונה
            if (paragraph !== correctAnswer && !options.includes(paragraph)) {
                options.push(paragraph);
            } else {
                // אם המסיח זהה לתשובה הנכונה, יצירת וריאציה
                options.push(this.createVariation(correctAnswer));
            }
        }
        
        // ערבוב המסיחים
        return this.shuffleArray(options);
    }
    
    // יצירת וריאציה לתשובה
    createVariation(answer) {
        // חלוקת התשובה למילים
        const words = answer.split(' ');
        
        if (words.length <= 5) {
            // אם התשובה קצרה, נוסיף מילה או שתיים
            return answer + ' אך יש לזכור שזה לא תמיד המקרה.';
        }
        
        // אם התשובה ארוכה, נשנה חלק מהמילים או נשמיט חלק
        const variationType = Math.floor(Math.random() * 3);
        
        switch (variationType) {
            case 0: // החלפת מילים
                for (let i = 0; i < Math.min(3, Math.floor(words.length / 4)); i++) {
                    const index = Math.floor(Math.random() * words.length);
                    if (words[index].length > 3) {
                        words[index] = this.getOppositeWord(words[index]);
                    }
                }
                return words.join(' ');
                
            case 1: // שינוי סדר חלקי משפט
                if (words.length > 10) {
                    const midPoint = Math.floor(words.length / 2);
                    const firstHalf = words.slice(0, midPoint);
                    const secondHalf = words.slice(midPoint);
                    return secondHalf.join(' ') + ' ' + firstHalf.join(' ');
                }
                return words.join(' ') + ' בדיוק להיפך ממה שמקובל לחשוב.';
                
            case 2: // השמטת חלק וסיום שונה
                const truncatedLength = Math.floor(words.length * 0.7);
                return words.slice(0, truncatedLength).join(' ') + ' וכך הלאה וכן הלאה.';
                
            default:
                return answer;
        }
    }
    
    // פונקציה להחלפת מילה במילה הפוכה או שונה
    getOppositeWord(word) {
        const opposites = {
            'כן': 'לא',
            'לא': 'כן',
            'תמיד': 'לעולם לא',
            'לעולם': 'תמיד',
            'הרבה': 'מעט',
            'מעט': 'הרבה',
            'גדול': 'קטן',
            'קטן': 'גדול',
            'חשוב': 'שולי',
            'עיקרי': 'משני',
            'משני': 'עיקרי',
            'אפשרי': 'בלתי אפשרי',
            'נכון': 'שגוי',
            'שגוי': 'נכון',
            'חיובי': 'שלילי',
            'שלילי': 'חיובי'
        };
        
        // אם יש מילה הפוכה מוגדרת, נשתמש בה
        if (opposites[word]) {
            return opposites[word];
        }
        
        // אחרת, נוסיף מילת שלילה או נשנה את הסיומת
        if (word.length > 5) {
            if (Math.random() < 0.5) {
                return 'לא ' + word;
            } else {
                // שינוי סיומת המילה
                return word.substring(0, word.length - 2) + (Math.random() < 0.5 ? 'יים' : 'ות');
            }
        }
        
        return word; // החזרת המילה המקורית אם אין אפשרות לשנות
    }
    
    // ערבוב מערך
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // בדיקת תשובת המשתמש
    checkAnswer(userAnswer) {
        if (!this.currentQuestion) {
            throw new Error('אין שאלה נוכחית לבדיקה');
        }
        
        const isCorrect = userAnswer === this.currentQuestion.correctAnswer;
        
        return {
            isCorrect,
            correctAnswer: this.currentQuestion.correctAnswer,
            explanation: this.currentQuestion.explanation
        };
    }
}