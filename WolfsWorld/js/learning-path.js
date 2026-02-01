/**
 * Learning Path Logic
 * Handles navigation, progress tracking, and interactive elements.
 */

class LearningPath {
    constructor(configUrl = 'course.json') {
        this.configUrl = configUrl;
        this.courseData = null;
        this.currentPageIndex = -1;
        this.progress = this.loadProgress();
        this.taskCompleted = false; // Task completion flag
    }

    async init() {
        try {
            // Versuche inline course data zu verwenden (fällt zurück auf fetch)
            if (window.COURSE_DATA) {
                this.courseData = window.COURSE_DATA;
            } else {
                const response = await fetch(this.configUrl);
                if (!response.ok) throw new Error('Failed to load course config');
                this.courseData = await response.json();
            }
            
            this.determineCurrentPage();
            this.renderHeader(); // Updates title and progress bar
            this.renderNavigation(); // Updates footer buttons
            this.setupInteractivity(); // Handlers for hints/quizzes
            this.updateProgress();
        } catch (error) {
            console.error('Learning Path Init Error:', error);
            // Fallback: Zeige nur Hauptmenü-Button
            this.renderFallbackNavigation();
        }
    }
    
    renderFallbackNavigation() {
        const navContainers = document.querySelectorAll('.lp-navigation');
        navContainers.forEach(container => {
            container.innerHTML = '';
            container.style.display = 'flex';
            container.style.justifyContent = 'center';
            const btn = this.createNavButton('Hauptmenü', '../../index.html', 'outline');
            container.appendChild(btn);
        });
    }

    determineCurrentPage() {
        // More robust filename matching
        const path = window.location.pathname;
        const filename = path.split('/').pop().split('?')[0]; // Remove query params
        
        if (this.courseData && this.courseData.lessons) {
            // Try specific match
            this.currentPageIndex = this.courseData.lessons.findIndex(l => 
                l.file === filename || l.file.endsWith(filename)
            );
            
            // Debug if not found
            if (this.currentPageIndex === -1) {
                console.warn('Could not find current page in course.json:', filename);
            }
        }
    }

    loadProgress() {
        const stored = localStorage.getItem('lp_progress');
        return stored ? JSON.parse(stored) : {}; 
    }

    saveProgress(lessonIndex) {
        if (!this.courseData) return;
        const courseId = this.courseData.id || 'default_course';
        
        let currentMax = this.progress[courseId] || 0;
        // Keep highest progress
        if (lessonIndex > currentMax) {
            this.progress[courseId] = lessonIndex;
            localStorage.setItem('lp_progress', JSON.stringify(this.progress));
        }
    }

    renderHeader() {
        // Update Title
        if (this.currentPageIndex >= 0) {
            const lesson = this.courseData.lessons[this.currentPageIndex];
            
            // Update Page Title
            document.title = `${lesson.title} - ${this.courseData.title}`;
            
            // Update Progress Bar (supports multiple selectors for different layouts)
            const progressFills = document.querySelectorAll('.lp-progress-fill');
            const pct = Math.round(((this.currentPageIndex + 1) / this.courseData.lessons.length) * 100);
            
            progressFills.forEach(el => {
                el.style.width = `${pct}%`;
            });

            // Update Header Text if placeholder exists
            const headerTitle = document.querySelector('.lp-dynamic-title');
            if (headerTitle) headerTitle.textContent = lesson.title;
        }
    }

    renderNavigation() {
        const navContainers = document.querySelectorAll('.lp-navigation');
        
        navContainers.forEach(container => {
            container.innerHTML = '';
            container.style.display = 'flex';
            container.style.justifyContent = 'space-between';
            container.style.gap = '10px';

            if (this.currentPageIndex === -1) {
                const btn = this.createNavButton('Hauptmenü', '../../index.html', 'outline');
                container.appendChild(btn);
                return;
            }

            // Prev Button
            if (this.currentPageIndex > 0) {
                const prevUrl = this.courseData.lessons[this.currentPageIndex - 1].file;
                const btn = this.createNavButton('Zurück', prevUrl, 'outline');
                container.appendChild(btn);
            } else {
                const btn = this.createNavButton('Hauptmenü', '../../index.html', 'outline');
                container.appendChild(btn);
            }

            // Next Button
            if (this.currentPageIndex < this.courseData.lessons.length - 1) {
                const nextUrl = this.courseData.lessons[this.currentPageIndex + 1].file;
                const btn = this.createNavButton('Weiter', nextUrl, 'primary');
                btn.id = 'lp-next-btn'; // ID für spätere Referenz
                
                // Prüfe ob Aufgabe erfüllt ist
                if (this.taskCompleted !== true) {
                    btn.style.opacity = '0.5';
                    btn.style.pointerEvents = 'none';
                    btn.title = 'Erfülle zuerst die Aufgabe';
                }
                
                container.appendChild(btn);
            } else {
                const btn = this.createNavButton('Abschließen', '../../index.html', 'success');
                container.appendChild(btn);
            }
        });
    }

    createNavButton(text, url, type) {
        const btn = document.createElement('a');
        btn.href = url;
        if (type === 'outline') {
            btn.className = 'lp-btn lp-btn-outline';
            btn.innerHTML = `&larr; ${text}`;
        } else if (type === 'success') {
            btn.className = 'lp-btn';
            btn.style.backgroundColor = '#2ecc71';
            btn.innerHTML = `${text} &#10003;`;
        } else {
            btn.className = 'lp-btn';
            btn.innerHTML = `${text} &rarr;`;
        }
        return btn;
    }

    setupInteractivity() {
        // Cheat Button: SHIFT+N geht zur nächsten Seite oder zum Hauptmenü (funktioniert immer)
        document.addEventListener('keydown', (e) => {
            if (e.shiftKey && e.key === 'N') {
                if (this.currentPageIndex >= 0 && this.currentPageIndex < this.courseData.lessons.length - 1) {
                    const nextUrl = this.courseData.lessons[this.currentPageIndex + 1].file;
                    window.location.href = nextUrl;
                } else if (this.currentPageIndex === this.courseData.lessons.length - 1) {
                    // Letztes Lesson - gehe zum Hauptmenü
                    window.location.href = '../../index.html';
                }
            }
        });
        
        // Hint Toggles
        document.querySelectorAll('.lp-toggle-answer').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const target = document.getElementById(targetId);
                if (target) {
                    target.classList.toggle('visible');
                    const textSpan = btn.querySelector('.btn-text') || btn;
                    // Toggle Text if simple button
                    if (target.classList.contains('visible')) {
                        // Optional text toggle
                    }
                }
            });
        });
    }

    updateProgress() {
        if (this.currentPageIndex >= 0) {
            this.saveProgress(this.currentPageIndex);
        }
    }

    /**
     * Aktiviert den Weiter-Button, wenn die Aufgabe erfüllt wurde
     */
    enableNextButton() {
        this.taskCompleted = true;
        const nextBtn = document.getElementById('lp-next-btn');
        if (nextBtn) {
            nextBtn.style.opacity = '1';
            nextBtn.style.pointerEvents = 'auto';
            nextBtn.title = '';
        }
    }
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    const meta = document.querySelector('meta[name="course-config"]');
    const configPath = meta ? meta.content : 'course.json';
    window.learningPath = new LearningPath(configPath);
    window.learningPath.init();
});
