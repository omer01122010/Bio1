// משתנים גלובליים
let pdfProcessor;
let questionGenerator;
let currentQuestion;
let selectedAnswer;

// איתחול האפליקציה
async function initApp() {
    try {
        // יצירת מעבד PDF
        pdfProcessor = new PDFProcessor();
        
        // הצגת מסך טעינה
        document.getElementById('loading-screen').style.display = 'block';
        document.getElementById('question-container').style.display = 'none';
        
        // טעינת קבצי PDF
        const pdfData = await pdfProcessor.loadAllPDFs();
        
        // הסתרת מסך טעינה
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('question-container').style.display = 'block';
        
        // יצירת מחולל שאלות
        questionGenerator = new QuestionGenerator(pdfData);
        
        // הצגת שאלה ראשונה
        showNextQuestion();
        
        // הוספת מאזינים לאירועים
        document.getElementById('submit-btn').addEventListener('click', submitAnswer);
        document.getElementById('next-btn').addEventListener('click', showNextQuestion);
        
        console.log('האפליקציה אותחלה בהצלחה');
        console.log('סטטיסטיקה:', pdfProcessor.getStatistics());
    } catch (error) {
        console.error('שגיאה באיתחול האפליקציה:', error);
        document.getElementById('loading-status').textContent = 'שגיאה בטעינת המידע. בדוק את הקונסולה לפרטים.';
    }
}

// הצגת שאלה חדשה
function showNextQuestion() {
    try {
        // איפוס הממשק
        resetInterface();
        
        // יצירת שאלה חדשה
        currentQuestion = questionGenerator.generateUniqueQuestion();
        
        // הצגת טקסט השאלה
        document.getElementById('question-text').textContent = currentQuestion.questionText;
        
        // הצגת המסיחים
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        currentQuestion.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.dataset.value = option;
            
            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.name = 'answer';
            radioInput.id = `option-${index}`;
            radioInput.value = option;
            
            const label = document.createElement('label');
            label.htmlFor = `option-${index}`;
            label.textContent = option;
            
            optionElement.appendChild(radioInput);
            optionElement.appendChild(label);
            
            optionElement.addEventListener('click', () => selectOption(optionElement));
            
            optionsContainer.appendChild(optionElement);
        });
        
        // הפעלת כפתור השליחה
        document.getElementById('submit-btn').disabled = true;
        document.getElementById('next-btn').disabled = true;
        
    } catch (error) {
        console.error('שגיאה בהצגת שאלה חדשה:', error);
        alert('אירעה שגיאה בהצגת שאלה חדשה. נא לנסות שוב.');
    }
}

// בחירת מסיח
function selectOption(selectedOptionElement) {
    // איפוס כל המסיחים
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected');
        option.querySelector('input').checked = false;
    });
    
    // סימון המסיח הנבחר
    selectedOptionElement.classList.add('selected');
    selectedOptionElement.querySelector('input').checked = true;
    
    // שמירת התשובה שנבחרה
    selectedAnswer = selectedOptionElement.dataset.value;
    
    // הפעלת כפתור השליחה
    document.getElementById('submit-btn').disabled = false;
}

// שליחת תשובה
function submitAnswer() {
    try {
        if (!selectedAnswer) {
            alert('נא לבחור תשובה');
            return;
        }
        
        // בדיקת התשובה
        const result = questionGenerator.checkAnswer(selectedAnswer);
        
        // הצגת משוב
        const feedbackElement = document.getElementById('feedback');
        feedbackElement.innerHTML = '';
        feedbackElement.classList.remove('hidden', 'correct', 'incorrect');
        
        const resultTitle = document.createElement('h3');
        
        if (result.isCorrect) {
            feedbackElement.classList.add('correct');
            resultTitle.textContent = 'צדקת!';
        } else {
            feedbackElement.classList.add('incorrect');
            resultTitle.textContent = 'טעית!';
        }
        
        const explanation = document.createElement('p');
        explanation.textContent = result.explanation;
        
        feedbackElement.appendChild(resultTitle);
        feedbackElement.appendChild(explanation);
        feedbackElement.classList.remove('hidden');
        
        // הפעלת כפתור המעבר לשאלה הבאה
        document.getElementById('next-btn').disabled = false;
        document.getElementById('submit-btn').disabled = true;
        
    } catch (error) {
        console.error('שגיאה בבדיקת התשובה:', error);
        alert('אירעה שגיאה בבדיקת התשובה. נא לנסות שוב.');
    }
}

// איפוס ממשק המשתמש
function resetInterface() {
    // איפוס משוב
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.innerHTML = '';
    feedbackElement.classList.add('hidden');
    feedbackElement.classList.remove('correct', 'incorrect');
    
    // איפוס תשובה נבחרת
    selectedAnswer = null;
}

// הפעלת האפליקציה כאשר הדף נטען
document.addEventListener('DOMContentLoaded', initApp);