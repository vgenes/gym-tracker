# 🏋️ Gym Routine Tracker

Track your gym workouts, routines, and progress with both a **web interface** and **command-line application**.

## Features

- **Log Workouts**: Record exercises, sets, reps, and weights
- **Create Routines**: Save your favorite workout routines for quick logging
- **View History**: Review your past workouts
- **Track Progress**: Monitor your improvement on specific exercises over time
- **Statistics**: See overall stats including total workouts, exercises, and most frequent exercises
- **Persistent Storage**: All data saved locally (localStorage for web, JSON for CLI)

## 🌐 Web App (Recommended)

### Requirements
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No installation required!

### Usage

Simply open `index.html` in your web browser:

```bash
# Option 1: Open directly
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows

# Option 2: Use a local server (recommended)
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

### Features
- 📊 **Dashboard**: View your stats and recent activity
- ➕ **Log Workout**: Easy form-based workout logging
- 📅 **History**: Browse all past workouts
- 📋 **Routines**: Create and manage workout routines
- 📈 **Progress**: Track performance on specific exercises

All data is stored in your browser's localStorage - no server needed!

## 🖥️ Command Line App

### Requirements
- Python 3.6 or higher (no external dependencies required!)

### Installation

1. Clone this repository or download the files
2. Make the script executable (optional):
   ```bash
   chmod +x gym_tracker.py
   ```

### Usage

Run the application:

```bash
python3 gym_tracker.py
```

Or if you made it executable:

```bash
./gym_tracker.py
```

## Menu Options

### 1. Log Workout
Record a new workout session. You can:
- Use a saved routine or create a custom workout
- Log multiple exercises with multiple sets
- Record reps, weight, and optional notes for each set

**Example:**
```
Exercise: Bench Press
  Set 1 - Reps: 10, Weight: 135 lbs
  Set 2 - Reps: 8, Weight: 145 lbs
  Set 3 - Reps: 6, Weight: 155 lbs
```

### 2. View History
Display your recent workouts with all details. You can specify how many workouts to show (default: 10).

### 3. Create Routine
Save a workout routine with predefined exercises for quick logging later.

**Example Routines:**
- Push Day: Bench Press, Overhead Press, Tricep Dips
- Pull Day: Pull-ups, Barbell Rows, Bicep Curls
- Leg Day: Squats, Deadlifts, Leg Press, Calf Raises

### 4. List Routines
View all your saved workout routines.

### 5. View Progress
Track your progress on a specific exercise over time. Enter an exercise name to see all instances you've performed it, with dates and details.

### 6. View Stats
See your overall workout statistics:
- Total number of workouts
- Total exercises logged
- Total sets completed
- Most frequent exercises

### 7. Exit
Save and exit the application.

## Data Storage

All workout data is stored in `gym_data.json` in the same directory as the script. This file is created automatically on first use.

**Data structure:**
```json
{
  "workouts": [
    {
      "date": "2026-01-01T10:30:00",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": [
            {"reps": 10, "weight": 135, "notes": ""}
          ]
        }
      ]
    }
  ],
  "routines": {
    "Push Day": ["Bench Press", "Overhead Press", "Tricep Dips"]
  }
}
```

## Tips

1. **Be Consistent**: Log your workouts immediately after finishing for best results
2. **Use Routines**: Create routines for your regular workout splits to save time
3. **Track Progress**: Regularly check your progress on key exercises to stay motivated
4. **Add Notes**: Use the notes field to record how the set felt, form cues, or other observations
5. **Backup Your Data**: Periodically backup `gym_data.json` to avoid losing your history

## Example Workflow

1. Create a routine for your workout split:
   - Run the app and select "3. Create Routine"
   - Name it "Push Day"
   - Add exercises: Bench Press, Overhead Press, Tricep Dips, Lateral Raises

2. Log your workout:
   - Select "1. Log Workout"
   - Choose "Push Day" routine
   - Log sets for each exercise

3. Track your progress:
   - Select "5. View Progress"
   - Enter "Bench Press"
   - See your improvement over time!

## Contributing

Feel free to submit issues or pull requests for improvements!

## License

MIT License - feel free to use and modify as needed.

---

**Happy lifting! 💪**
