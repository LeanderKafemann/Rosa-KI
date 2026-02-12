// Page-specific scripts for learning/viewer.html
const Viewer = {
            pathId: null,
            currentStepIndex: 0,
            pathData: null,

            init() {
                // Liest ?path=xyz aus der URL
                const params = new URLSearchParams(window.location.search);
                this.pathId = params.get('path');

                if (!this.pathId || !LEARNING_PATHS[this.pathId]) {
                    alert("Lernpfad nicht gefunden!");
                    window.location.href = "../index.html";
                    return;
                }

                this.pathData = LEARNING_PATHS[this.pathId];
                this.renderSidebar();
                this.loadStep(0);
            },

            renderSidebar() {
                document.getElementById('pathTitle').innerText = this.pathData.title;
                const list = document.getElementById('stepList');
                list.innerHTML = '';

                this.pathData.steps.forEach((step, index) => {
                    const li = document.createElement('li');
                    li.className = 'step-item';
                    li.id = `step-btn-${index}`;
                    li.innerText = step.title;
                    li.onclick = () => this.loadStep(index);
                    list.appendChild(li);
                });
            },

            loadStep(index) {
                if (index < 0 || index >= this.pathData.steps.length) return;
                
                this.currentStepIndex = index;
                const step = this.pathData.steps[index];

                // WICHTIG: Pfad zum Modul bauen (modules/ + Unterordner/Datei)
                const modulePath = `modules/${step.file}`;
                document.getElementById('contentFrame').src = modulePath;

                // UI Updates
                document.querySelectorAll('.step-item').forEach(el => el.classList.remove('active'));
                const activeBtn = document.getElementById(`step-btn-${index}`);
                if(activeBtn) activeBtn.classList.add('active');
                if(activeBtn) activeBtn.scrollIntoView({ block: 'nearest' });

                document.getElementById('progressText').innerText = 
                    `Schritt ${index + 1} von ${this.pathData.steps.length}`;

                // Buttons
                document.getElementById('prevBtn').disabled = (index === 0);
                
                const nextBtn = document.getElementById('nextBtn');
                if (index === this.pathData.steps.length - 1) {
                    nextBtn.innerText = "Abschließen 🏁";
                    nextBtn.className = "viz-btn btn-restart"; // Gelb
                    nextBtn.onclick = () => {
                        if(confirm("Glückwunsch! Zurück zum Menü?")) window.location.href = "../index.html";
                    };
                } else {
                    nextBtn.innerText = "Weiter ▶";
                    nextBtn.className = "viz-btn btn-action"; // Grün/Blau
                    nextBtn.onclick = () => this.next();
                }
            },

            next() { this.loadStep(this.currentStepIndex + 1); },
            prev() { this.loadStep(this.currentStepIndex - 1); }
        };

        window.onload = () => Viewer.init();
