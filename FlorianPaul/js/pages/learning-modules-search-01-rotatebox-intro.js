// Page-specific scripts for learning/modules/search/01-rotatebox-intro.html
function checkQ1() {
            const selected = document.querySelector('input[name="q1"]:checked');
            const feedback = document.getElementById('feedback1');
            
            if (!selected) {
                feedback.textContent = '⚠️ Bitte eine Antwort wählen!';
                feedback.className = 'feedback show';
                return;
            }
            
            if (selected.value === 'c') {
                feedback.textContent = '✅ Richtig! Mit 9 Feldern und je 2 Zustände = 2^9 = 512 mögliche Zustände.';
                feedback.className = 'feedback show correct';
            } else {
                feedback.textContent = '❌ Nicht ganz. Jedes Feld kann 2 Farben haben (rot oder grün), also 2^9 = 512 Kombinationen.';
                feedback.className = 'feedback show incorrect';
            }
        }

        function checkQ2() {
            const selected = document.querySelector('input[name="q2"]:checked');
            const feedback = document.getElementById('feedback2');
            
            if (!selected) {
                feedback.textContent = '⚠️ Bitte eine Antwort wählen!';
                feedback.className = 'feedback show';
                return;
            }
            
            if (selected.value === 'b') {
                feedback.textContent = '✅ Richtig! BFS erkundet alle Knoten einer Tiefe, daher findet es den kürzesten Weg garantiert.';
                feedback.className = 'feedback show correct';
            } else {
                feedback.textContent = '❌ Das ist nicht richtig. BFS garantiert den kürzesten Weg, DFS nicht unbedingt.';
                feedback.className = 'feedback show incorrect';
            }
        }

        function openViz() {
            // Öffne die Rotatebox-Visualisierung
            window.open('../../../playground/rotatebox-viz.html', '_blank');
        }

        function nextLesson() {
            window.location.href = '02-search-space.html';
        }

        // Auto-save progress
        document.addEventListener('DOMContentLoaded', function() {
            localStorage.setItem('lesson_1_completed', JSON.stringify({
                completed: true,
                timestamp: new Date().toISOString()
            }));
        });
