// Page-specific scripts for learning/modules/search/02-search-space.html
function toggleSolution1() {
            const sol = document.getElementById('solution1');
            sol.style.display = sol.style.display === 'none' ? 'block' : 'none';
        }

        function openVisualization() {
            window.open('../../../playground/rotatebox-viz.html', '_blank');
        }

        document.addEventListener('DOMContentLoaded', function() {
            localStorage.setItem('lesson_2_completed', JSON.stringify({
                completed: true,
                timestamp: new Date().toISOString()
            }));
        });
