// Page-specific scripts for learning/modules/search/index.html
function goToLesson(file) {
            window.location.href = file;
        }

        // Load progress from localStorage
        document.addEventListener('DOMContentLoaded', function() {
            const lesson1 = localStorage.getItem('lesson_1_completed');
            const lesson2 = localStorage.getItem('lesson_2_completed');
            
            if (lesson1 || lesson2) {
                console.log('Fortschritt gefunden: Lektionen abgeschlossen');
            }
        });
