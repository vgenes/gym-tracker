// Gym Tracker App - Main JavaScript File

class GymTracker {
    constructor() {
        this.data = this.loadData();
        this.currentView = 'dashboard';
        this.init();
    }

    // Initialize the app
    init() {
        this.setupEventListeners();
        this.loadRoutineOptions();
        this.updateDashboard();
        this.renderHistory();
        this.renderRoutines();
        this.populateExerciseList();
    }

    // Load data from localStorage
    loadData() {
        const saved = localStorage.getItem('gymTrackerData');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            workouts: [],
            routines: {}
        };
    }

    // Save data to localStorage
    saveData() {
        localStorage.setItem('gymTrackerData', JSON.stringify(this.data));
    }

    // Setup event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Log Workout
        document.getElementById('add-exercise-btn').addEventListener('click', () => {
            this.addExerciseCard();
        });

        document.getElementById('save-workout-btn').addEventListener('click', () => {
            this.saveWorkout();
        });

        document.getElementById('clear-workout-btn').addEventListener('click', () => {
            this.clearWorkout();
        });

        document.getElementById('routine-select').addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadRoutineToWorkout(e.target.value);
            }
        });

        // Routines
        document.getElementById('add-routine-exercise-btn').addEventListener('click', () => {
            this.addRoutineExerciseInput();
        });

        document.getElementById('save-routine-btn').addEventListener('click', () => {
            this.saveRoutine();
        });

        // Progress
        document.getElementById('view-progress-btn').addEventListener('click', () => {
            this.viewProgress();
        });

        // History filter
        document.getElementById('history-limit').addEventListener('change', () => {
            this.renderHistory();
        });
    }

    // Switch between views
    switchView(viewName) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Update views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`).classList.add('active');

        this.currentView = viewName;

        // Refresh data for certain views
        if (viewName === 'dashboard') {
            this.updateDashboard();
        } else if (viewName === 'history') {
            this.renderHistory();
        } else if (viewName === 'routines') {
            this.renderRoutines();
        }
    }

    // Dashboard functions
    updateDashboard() {
        const stats = this.calculateStats();

        document.getElementById('total-workouts').textContent = stats.totalWorkouts;
        document.getElementById('total-exercises').textContent = stats.totalExercises;
        document.getElementById('total-sets').textContent = stats.totalSets;
        document.getElementById('total-routines').textContent = stats.totalRoutines;

        this.renderFrequentExercises(stats.exerciseCounts);
        this.renderRecentActivity();
    }

    calculateStats() {
        const totalWorkouts = this.data.workouts.length;
        const totalExercises = this.data.workouts.reduce((sum, w) => sum + w.exercises.length, 0);
        const totalSets = this.data.workouts.reduce((sum, w) => {
            return sum + w.exercises.reduce((eSum, e) => eSum + e.sets.length, 0);
        }, 0);
        const totalRoutines = Object.keys(this.data.routines).length;

        // Count exercise frequency
        const exerciseCounts = {};
        this.data.workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                exerciseCounts[exercise.name] = (exerciseCounts[exercise.name] || 0) + 1;
            });
        });

        return {
            totalWorkouts,
            totalExercises,
            totalSets,
            totalRoutines,
            exerciseCounts
        };
    }

    renderFrequentExercises(exerciseCounts) {
        const container = document.getElementById('frequent-exercises');

        if (Object.keys(exerciseCounts).length === 0) {
            container.innerHTML = '<p class="empty-state">No workouts logged yet. Start by logging your first workout!</p>';
            return;
        }

        const sorted = Object.entries(exerciseCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        container.innerHTML = sorted.map(([name, count]) => `
            <div class="exercise-item">
                <span class="exercise-item-name">${name}</span>
                <span class="exercise-item-count">${count} times</span>
            </div>
        `).join('');
    }

    renderRecentActivity() {
        const container = document.getElementById('recent-activity');

        if (this.data.workouts.length === 0) {
            container.innerHTML = '<p class="empty-state">No recent activity</p>';
            return;
        }

        const recent = [...this.data.workouts]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        container.innerHTML = recent.map(workout => {
            const date = new Date(workout.date);
            const exerciseNames = workout.exercises.map(e => e.name).join(', ');
            return `
                <div class="recent-item">
                    <div class="recent-item-date">${this.formatDate(date)}</div>
                    <div class="recent-item-text">${exerciseNames}</div>
                </div>
            `;
        }).join('');
    }

    // Log Workout functions
    addExerciseCard() {
        const template = document.getElementById('exercise-template');
        const clone = template.content.cloneNode(true);

        const removeBtn = clone.querySelector('.btn-remove');
        removeBtn.addEventListener('click', (e) => {
            e.target.closest('.exercise-card').remove();
        });

        const addSetBtn = clone.querySelector('.add-set-btn');
        addSetBtn.addEventListener('click', (e) => {
            this.addSetRow(e.target.closest('.exercise-card'));
        });

        document.getElementById('exercises-container').appendChild(clone);

        // Add first set automatically
        const cards = document.querySelectorAll('.exercise-card');
        const newCard = cards[cards.length - 1];
        this.addSetRow(newCard);
    }

    addSetRow(exerciseCard) {
        const template = document.getElementById('set-template');
        const clone = template.content.cloneNode(true);

        const setsContainer = exerciseCard.querySelector('.sets-container');
        const setNumber = setsContainer.children.length + 1;

        clone.querySelector('.set-number').textContent = `Set ${setNumber}`;

        const removeBtn = clone.querySelector('.btn-remove-set');
        removeBtn.addEventListener('click', (e) => {
            e.target.closest('.set-row').remove();
            this.renumberSets(exerciseCard);
        });

        setsContainer.appendChild(clone);
    }

    renumberSets(exerciseCard) {
        const sets = exerciseCard.querySelectorAll('.set-row');
        sets.forEach((set, index) => {
            set.querySelector('.set-number').textContent = `Set ${index + 1}`;
        });
    }

    loadRoutineToWorkout(routineName) {
        const exercises = this.data.routines[routineName];
        if (!exercises) return;

        // Clear existing
        document.getElementById('exercises-container').innerHTML = '';

        // Add exercise for each in routine
        exercises.forEach(exercise => {
            // Support both old format (string) and new format (object with sets/reps/weight)
            if (typeof exercise === 'string') {
                // Old format - just exercise name
                this.addExerciseCard();
                const cards = document.querySelectorAll('.exercise-card');
                const lastCard = cards[cards.length - 1];
                lastCard.querySelector('.exercise-name').value = exercise;
            } else {
                // New format - object with name, sets, reps, weight
                this.addExerciseCard();
                const cards = document.querySelectorAll('.exercise-card');
                const lastCard = cards[cards.length - 1];

                // Set exercise name
                lastCard.querySelector('.exercise-name').value = exercise.name;

                // Add sets with pre-filled reps and weight
                const numSets = exercise.sets || 3;
                for (let i = 0; i < numSets; i++) {
                    // First set is added automatically by addExerciseCard, so skip for i=0
                    if (i > 0) {
                        this.addSetRow(lastCard);
                    }
                }

                // Fill in reps and weights for all sets
                const setRows = lastCard.querySelectorAll('.set-row');
                setRows.forEach(row => {
                    if (exercise.reps) {
                        row.querySelector('.set-reps').value = exercise.reps;
                    }
                    if (exercise.weight) {
                        row.querySelector('.set-weight').value = exercise.weight;
                    }
                });
            }
        });
    }

    saveWorkout() {
        const exerciseCards = document.querySelectorAll('.exercise-card');

        if (exerciseCards.length === 0) {
            alert('Please add at least one exercise');
            return;
        }

        const exercises = [];
        let hasError = false;

        exerciseCards.forEach(card => {
            const name = card.querySelector('.exercise-name').value.trim();
            if (!name) {
                hasError = true;
                return;
            }

            const notes = card.querySelector('.exercise-notes').value.trim();
            const sets = [];
            const setRows = card.querySelectorAll('.set-row');

            setRows.forEach(row => {
                const reps = parseInt(row.querySelector('.set-reps').value);
                const weight = parseFloat(row.querySelector('.set-weight').value) || 0;

                if (reps) {
                    sets.push({ reps, weight });
                }
            });

            if (sets.length > 0) {
                exercises.push({ name, sets, notes });
            }
        });

        if (hasError) {
            alert('Please fill in all exercise names');
            return;
        }

        if (exercises.length === 0) {
            alert('Please add at least one set to an exercise');
            return;
        }

        const workout = {
            date: new Date().toISOString(),
            exercises
        };

        this.data.workouts.push(workout);
        this.saveData();

        alert(`✅ Workout saved! Logged ${exercises.length} exercises`);
        this.clearWorkout();
        this.updateDashboard();
    }

    clearWorkout() {
        document.getElementById('exercises-container').innerHTML = '';
        document.getElementById('routine-select').value = '';
    }

    // Routines functions
    loadRoutineOptions() {
        const select = document.getElementById('routine-select');
        select.innerHTML = '<option value="">Custom Workout</option>';

        Object.keys(this.data.routines).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
    }

    addRoutineExerciseInput() {
        const container = document.getElementById('routine-exercises');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'routine-exercise-input';
        input.placeholder = 'Exercise name';
        container.appendChild(input);
    }

    saveRoutine() {
        const name = document.getElementById('routine-name').value.trim();
        if (!name) {
            alert('Please enter a routine name');
            return;
        }

        const inputs = document.querySelectorAll('.routine-exercise-input');
        const exercises = [];

        inputs.forEach(input => {
            const value = input.value.trim();
            if (value) {
                exercises.push(value);
            }
        });

        if (exercises.length === 0) {
            alert('Please add at least one exercise');
            return;
        }

        this.data.routines[name] = exercises;
        this.saveData();

        alert(`✅ Routine "${name}" saved with ${exercises.length} exercises!`);

        // Clear form
        document.getElementById('routine-name').value = '';
        document.getElementById('routine-exercises').innerHTML =
            '<input type="text" class="routine-exercise-input" placeholder="Exercise name">';

        this.renderRoutines();
        this.loadRoutineOptions();
        this.updateDashboard();
    }

    renderRoutines() {
        const container = document.getElementById('routines-list');
        const routines = Object.entries(this.data.routines);

        if (routines.length === 0) {
            container.innerHTML = '<p class="empty-state">No routines saved yet</p>';
            return;
        }

        container.innerHTML = routines.map(([name, exercises]) => `
            <div class="routine-item">
                <div class="routine-header">
                    <div class="routine-name">${name}</div>
                    <button class="btn-remove" onclick="app.deleteRoutine('${name}')">❌ Delete</button>
                </div>
                <ul class="routine-exercises-list">
                    ${exercises.map(ex => `<li>${ex}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    }

    deleteRoutine(name) {
        if (confirm(`Delete routine "${name}"?`)) {
            delete this.data.routines[name];
            this.saveData();
            this.renderRoutines();
            this.loadRoutineOptions();
            this.updateDashboard();
        }
    }

    // History functions
    renderHistory() {
        const container = document.getElementById('history-container');
        const limitSelect = document.getElementById('history-limit');
        const limit = limitSelect.value;

        if (this.data.workouts.length === 0) {
            container.innerHTML = '<p class="empty-state">No workout history yet</p>';
            return;
        }

        let workouts = [...this.data.workouts].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        if (limit !== 'all') {
            workouts = workouts.slice(0, parseInt(limit));
        }

        container.innerHTML = workouts.map(workout => {
            const date = new Date(workout.date);
            return `
                <div class="history-item">
                    <div class="history-date">📅 ${this.formatDate(date)}</div>
                    ${workout.exercises.map(exercise => `
                        <div class="history-exercise">
                            <div class="history-exercise-name">${exercise.name}</div>
                            ${exercise.sets.map((set, i) => `
                                <div class="history-set">
                                    Set ${i + 1}: ${set.reps} reps @ ${set.weight || 'bodyweight'}${set.weight ? ' lbs' : ''}
                                </div>
                            `).join('')}
                            ${exercise.notes ? `<div class="exercise-notes-display">📝 ${exercise.notes}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');
    }

    // Progress functions
    populateExerciseList() {
        const datalist = document.getElementById('exercise-list');
        const exercises = new Set();

        this.data.workouts.forEach(workout => {
            workout.exercises.forEach(exercise => {
                exercises.add(exercise.name);
            });
        });

        datalist.innerHTML = Array.from(exercises).map(name =>
            `<option value="${name}">`
        ).join('');
    }

    viewProgress() {
        const exerciseName = document.getElementById('exercise-search').value.trim();
        const container = document.getElementById('progress-container');

        if (!exerciseName) {
            alert('Please enter an exercise name');
            return;
        }

        const progressData = [];

        this.data.workouts.forEach(workout => {
            const date = new Date(workout.date);
            workout.exercises.forEach(exercise => {
                if (exercise.name.toLowerCase() === exerciseName.toLowerCase()) {
                    progressData.push({
                        date,
                        sets: exercise.sets
                    });
                }
            });
        });

        if (progressData.length === 0) {
            container.innerHTML = `<p class="empty-state">No history found for "${exerciseName}"</p>`;
            return;
        }

        // Sort by date
        progressData.sort((a, b) => a.date - b.date);

        container.innerHTML = `
            <h3>Progress for: ${exerciseName}</h3>
            ${progressData.map(entry => `
                <div class="progress-entry">
                    <div class="progress-date">📅 ${this.formatDate(entry.date)}</div>
                    ${entry.sets.map((set, i) => `
                        <div class="progress-set">
                            Set ${i + 1}: ${set.reps} reps @ ${set.weight || 'BW'}${set.weight ? ' lbs' : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        `;
    }

    // Utility functions
    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    const shouldInitApp = initAuth();

    // Only initialize gym tracker if already authenticated
    if (shouldInitApp) {
        app = new GymTracker();
    }
});
