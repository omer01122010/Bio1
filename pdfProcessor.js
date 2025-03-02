class PDFProcessor {
    constructor() {
        this.pdfjsLib = window['pdfjs-dist/build/pdf'];
        this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js';
        this.pdfData = {
            presentations: {},
            summaries: {}
        };
        this.loadedFiles = 0;
        this.totalFiles = 0;
    }

    async loadAllPDFs() {
        try {
            // שמות הקבצים ללא .pdf
            const presentationFiles = Array.from({length: 28}, (_, i) => `P${i+1}`);
            const summaryFiles = Array.from({length: 3}, (_, i) => `S${i+1}`);
            
            this.totalFiles = presentationFiles.length + summaryFiles.length;
            document.getElementById('loading-status').textContent = `0/${this.totalFiles} קבצים נטענו`;
            
            // טעינת המצגות
            for (let i = 0; i < presentationFiles.length; i++) {
                try {
                    await this.loadPDF(`/Bio1/PDF/${presentationFiles[i]}.pdf`, 'presentations', presentationFiles[i]);
                    this.updateLoadingStatus();
                } catch (error) {
                    console.warn(`קובץ ${presentationFiles[i]} לא נטען:`, error);
                }
            }
            
            // טעינת הסיכומים
            for (let i = 0; i < summaryFiles.length; i++) {
                try {
                    await this.loadPDF(`/Bio1/PDF/${summaryFiles[i]}.pdf`, 'summaries', summaryFiles[i]);
                    this.updateLoadingStatus();
                } catch (error) {
                    console.warn(`קובץ ${summaryFiles[i]} לא נטען:`, error);
                }
            }

            if (this.loadedFiles === 0) throw new Error('אף קובץ לא נטען בהצלחה');
            console.log('כל הקבצים נטענו בהצלחה');
            return this.pdfData;
        } catch (error) {
            console.error('שגיאה בטעינת קבצי PDF:', error);
            throw error;
        }
    }

    updateLoadingStatus() {
        this.loadedFiles++;
        document.getElementById('loading-status').textContent = `${this.loadedFiles}/${this.totalFiles} קבצים נטענו`;
    }

    async loadPDF(url, category, filename) {
        try {
            const loadingTask = this.pdfjsLib.getDocument(url);
            const pdf = await loadingTask.promise;
            const numPages = pdf.numPages;
            let content = '';
            
            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const textItems = textContent.items.map(item => item.str).join(' ');
                content += textItems + ' ';
            }
            
            if (category === 'presentations') {
                this.pdfData.presentations[filename] = this.processContent(content);
            } else if (category === 'summaries') {
                this.pdfData.summaries[filename] = this.processContent(content);
            }
            
            console.log(`הקובץ ${filename} נטען בהצלחה`);
        } catch (error) {
            console.error(`שגיאה בטעינת הקובץ ${filename}:`, error);
            throw error; // זורק שגיאה כדי שהיא תטופל ב-loadAllPDFs
        }
    }

    processContent(content) {
        content = content.replace(/\s+/g, ' ').trim();
        const paragraphs = content.split(/\.(?=\s[A-Z])|\.(?=\s?[א-ת])/g);
        return {
            fullText: content,
            paragraphs: paragraphs.filter(p => p.trim().length > 10)
        };
    }

    getStatistics() {
        const presentationCount = Object.keys(this.pdfData.presentations).length;
        const summaryCount = Object.keys(this.pdfData.summaries).length;
        let totalParagraphs = 0;
        let totalWords = 0;

        for (const key in this.pdfData.presentations) {
            totalParagraphs += this.pdfData.presentations[key].paragraphs.length;
            totalWords += this.countWords(this.pdfData.presentations[key].fullText);
        }

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

    countWords(text) {
        return text.split(/\s+/).length;
    }
}
}