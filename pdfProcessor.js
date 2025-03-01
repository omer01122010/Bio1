// מחלקה לעיבוד קבצי PDF
class PDFProcessor {
    constructor() {
        this.pdfjsLib = window['pdfjs-dist/build/pdf'];
        this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        this.pdfData = {
            presentations: {},
            summaries: {}
        };
        this.loadedFiles = 0;
        this.totalFiles = 0;
    }

    // פונקציה לטעינה של כל קבצי ה-PDF
    async loadAllPDFs() {
        try {
            // יצירת רשימת הקבצים לטעינה
            const presentationFiles = Array.from({length: 28}, (_, i) => `P${i+1}.pdf`);
            const summaryFiles = Array.from({length: 3}, (_, i) => `S${i+1}.pdf`);
            
            this.totalFiles = presentationFiles.length + summaryFiles.length;
            document.getElementById('loading-status').textContent = `0/${this.totalFiles} קבצים נטענו`;
            
            // טעינת המצגות
            for (let i = 0; i < presentationFiles.length; i++) {
                const filename = presentationFiles[i];
                await this.loadPDF(`/Bio1/PDF/${filename}`, 'presentations', filename);
                this.updateLoadingStatus();
            }
            
            // טעינת הסיכומים
            for (let i = 0; i < summaryFiles.length; i++) {
                const filename = summaryFiles[i];
                await this.loadPDF(`/Bio1/PDF/${filename}`, 'summaries', filename);
                this.updateLoadingStatus();
            }
            
            console.log('כל הקבצים נטענו בהצלחה');
            return this.pdfData;
        } catch (error) {
            console.error('שגיאה בטעינת קבצי PDF:', error);
            throw error;
        }
    }
    
    // עדכון התקדמות הטעינה
    updateLoadingStatus() {
        this.loadedFiles++;
        document.getElementById('loading-status').textContent = `${this.loadedFiles}/${this.totalFiles} קבצים נטענו`;
    }

    // פונקציה לטעינת קובץ PDF בודד
    async loadPDF(url, category, filename) {
        try {
            const loadingTask = this.pdfjsLib.getDocument(url);
            const pdf = await loadingTask.promise;
            const numPages = pdf.numPages;
            let content = '';
            
            // חילוץ טקסט מכל עמוד
            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const textItems = textContent.items.map(item => item.str).join(' ');
                content += textItems + ' ';
            }
            
            // שמירת התוכן המחולץ במבנה הנתונים שלנו
            if (category === 'presentations') {
                this.pdfData.presentations[filename] = this.processContent(content);
            } else if (category === 'summaries') {
                this.pdfData.summaries[filename] = this.processContent(content);
            }
            
            console.log(`הקובץ ${filename} נטען בהצלחה`);
        } catch (error) {
            console.error(`שגיאה בטעינת הקובץ ${filename}:`, error);
            // אנחנו ממשיכים למרות השגיאה כדי לטעון כמה שיותר קבצים
        }
    }
    
    // עיבוד תוכן טקסט - ניקוי וחלוקה למקטעים
    processContent(content) {
        // הסרת רווחים מיותרים
        content = content.replace(/\s+/g, ' ').trim();
        
        // חלוקה לפסקאות ע"י זיהוי נקודות וסימני פיסוק
        const paragraphs = content.split(/\.(?=\s[A-Z])|\.(?=\s?[א-ת])/g);
        
        return {
            fullText: content,
            paragraphs: paragraphs.filter(p => p.trim().length > 10) // סינון פסקאות קצרות מדי
        };
    }
    
    // הצגת סטטיסטיקה על המידע שנטען
    getStatistics() {
        const presentationCount = Object.keys(this.pdfData.presentations).length;
        const summaryCount = Object.keys(this.pdfData.summaries).length;
        
        let totalParagraphs = 0;
        let totalWords = 0;
        
        // ספירת פסקאות ומילים במצגות
        for (const key in this.pdfData.presentations) {
            totalParagraphs += this.pdfData.presentations[key].paragraphs.length;
            totalWords += this.countWords(this.pdfData.presentations[key].fullText);
        }
        
        // ספירת פסקאות ומילים בסיכומים
        for (const key in this.pdfData.summaries) {
            totalParagraphs += this.pdfData.summaries[key].paragraphs.length;
            totalWords += this.countWords(this.pdfData.summaries[key].fullText);
        }
        
        return {
            presentationCount,
            summaryCount,
            totalParagraphs,
            totalWords
        };
    }
    
    // פונקציית עזר לספירת מילים
    countWords(text) {
        return text.split(/\s+/).length;
    }
}