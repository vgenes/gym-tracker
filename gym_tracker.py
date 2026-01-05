#!/usr/bin/env python3
"""
Gym Routine Tracker - A simple CLI app to track your gym workouts
"""

import json
import os
from datetime import datetime
from typing import List, Dict, Optional


class GymTracker:
    def __init__(self, data_file: str = "gym_data.json"):
        self.data_file = data_file
        self.data = self._load_data()

    def _load_data(self) -> Dict:
        """Load workout data from JSON file"""
        if os.path.exists(self.data_file):
            with open(self.data_file, 'r') as f:
                return json.load(f)
        return {"workouts": [], "routines": {}}

    def _save_data(self):
        """Save workout data to JSON file"""
        with open(self.data_file, 'w') as f:
            json.dump(self.data, f, indent=2)

    def create_routine(self, name: str, exercises: List[str]):
        """Create a new workout routine"""
        self.data["routines"][name] = exercises
        self._save_data()
        print(f"✓ Routine '{name}' created with {len(exercises)} exercises")

    def list_routines(self):
        """Display all saved routines"""
        if not self.data["routines"]:
            print("No routines found. Create one with 'add-routine'")
            return

        print("\n=== Your Workout Routines ===")
        for name, exercises in self.data["routines"].items():
            print(f"\n{name}:")
            for i, exercise in enumerate(exercises, 1):
                print(f"  {i}. {exercise}")

    def log_workout(self, routine_name: Optional[str] = None):
        """Log a new workout session"""
        workout = {
            "date": datetime.now().isoformat(),
            "exercises": []
        }

        print("\n=== Log New Workout ===")
        print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}")

        # If routine specified, use those exercises
        if routine_name and routine_name in self.data["routines"]:
            exercises = self.data["routines"][routine_name]
            print(f"Using routine: {routine_name}\n")
        else:
            exercises = None

        while True:
            if exercises:
                print("\nExercises in routine:")
                for i, ex in enumerate(exercises, 1):
                    print(f"  {i}. {ex}")
                choice = input("\nSelect exercise number (or 'c' for custom, 'd' for done): ").strip()

                if choice.lower() == 'd':
                    break
                elif choice.lower() == 'c':
                    exercise_name = input("Exercise name: ").strip()
                elif choice.isdigit() and 1 <= int(choice) <= len(exercises):
                    exercise_name = exercises[int(choice) - 1]
                else:
                    print("Invalid choice")
                    continue
            else:
                exercise_name = input("\nExercise name (or 'done' to finish): ").strip()
                if exercise_name.lower() == 'done':
                    break

            if not exercise_name:
                continue

            exercise_data = {
                "name": exercise_name,
                "sets": []
            }

            print(f"\nLogging sets for: {exercise_name}")
            set_num = 1
            while True:
                reps_input = input(f"  Set {set_num} - Reps (or 'done'): ").strip()
                if reps_input.lower() == 'done':
                    break

                try:
                    reps = int(reps_input)
                    weight_input = input(f"  Set {set_num} - Weight (lbs/kg): ").strip()
                    weight = float(weight_input) if weight_input else 0
                    notes = input(f"  Set {set_num} - Notes (optional): ").strip()

                    exercise_data["sets"].append({
                        "reps": reps,
                        "weight": weight,
                        "notes": notes
                    })
                    set_num += 1
                except ValueError:
                    print("Invalid input. Please enter numbers for reps and weight.")

            if exercise_data["sets"]:
                workout["exercises"].append(exercise_data)

        if workout["exercises"]:
            self.data["workouts"].append(workout)
            self._save_data()
            print(f"\n✓ Workout logged successfully! ({len(workout['exercises'])} exercises)")
        else:
            print("\nNo exercises logged.")

    def view_history(self, limit: int = 10):
        """View recent workout history"""
        if not self.data["workouts"]:
            print("No workouts logged yet. Start with 'log-workout'")
            return

        print("\n=== Workout History ===")
        recent_workouts = sorted(
            self.data["workouts"],
            key=lambda x: x["date"],
            reverse=True
        )[:limit]

        for workout in recent_workouts:
            date = datetime.fromisoformat(workout["date"])
            print(f"\n📅 {date.strftime('%Y-%m-%d %H:%M')}")
            print("-" * 40)

            for exercise in workout["exercises"]:
                print(f"\n{exercise['name']}:")
                for i, set_data in enumerate(exercise["sets"], 1):
                    weight_str = f"{set_data['weight']}lbs" if set_data['weight'] else "bodyweight"
                    notes_str = f" - {set_data['notes']}" if set_data['notes'] else ""
                    print(f"  Set {i}: {set_data['reps']} reps @ {weight_str}{notes_str}")

    def view_progress(self, exercise_name: str):
        """View progress for a specific exercise"""
        print(f"\n=== Progress for: {exercise_name} ===\n")

        found = False
        for workout in sorted(self.data["workouts"], key=lambda x: x["date"]):
            date = datetime.fromisoformat(workout["date"])

            for exercise in workout["exercises"]:
                if exercise["name"].lower() == exercise_name.lower():
                    found = True
                    print(f"📅 {date.strftime('%Y-%m-%d')}")

                    for i, set_data in enumerate(exercise["sets"], 1):
                        weight_str = f"{set_data['weight']}lbs" if set_data['weight'] else "BW"
                        print(f"  Set {i}: {set_data['reps']} reps @ {weight_str}")
                    print()

        if not found:
            print(f"No history found for '{exercise_name}'")

    def get_stats(self):
        """Display overall workout statistics"""
        if not self.data["workouts"]:
            print("No workout data available yet.")
            return

        total_workouts = len(self.data["workouts"])
        total_exercises = sum(len(w["exercises"]) for w in self.data["workouts"])
        total_sets = sum(
            len(e["sets"])
            for w in self.data["workouts"]
            for e in w["exercises"]
        )

        # Find most common exercises
        exercise_counts = {}
        for workout in self.data["workouts"]:
            for exercise in workout["exercises"]:
                name = exercise["name"]
                exercise_counts[name] = exercise_counts.get(name, 0) + 1

        print("\n=== Your Gym Stats ===")
        print(f"Total Workouts: {total_workouts}")
        print(f"Total Exercises Logged: {total_exercises}")
        print(f"Total Sets Completed: {total_sets}")

        if exercise_counts:
            print("\nMost Frequent Exercises:")
            sorted_exercises = sorted(
                exercise_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]
            for exercise, count in sorted_exercises:
                print(f"  • {exercise}: {count} times")


def print_menu():
    """Display the main menu"""
    print("\n" + "="*50)
    print("🏋️  GYM ROUTINE TRACKER")
    print("="*50)
    print("\n1. Log Workout")
    print("2. View History")
    print("3. Create Routine")
    print("4. List Routines")
    print("5. View Progress (by exercise)")
    print("6. View Stats")
    print("7. Exit")
    print()


def main():
    """Main application loop"""
    tracker = GymTracker()

    print("\n🏋️  Welcome to Gym Routine Tracker!")

    while True:
        print_menu()
        choice = input("Select an option (1-7): ").strip()

        if choice == "1":
            # Ask if they want to use a routine
            if tracker.data["routines"]:
                print("\nAvailable routines:")
                for name in tracker.data["routines"].keys():
                    print(f"  • {name}")
                routine = input("\nEnter routine name (or press Enter for custom workout): ").strip()
                tracker.log_workout(routine if routine else None)
            else:
                tracker.log_workout()

        elif choice == "2":
            limit_input = input("How many recent workouts to show? (default 10): ").strip()
            limit = int(limit_input) if limit_input.isdigit() else 10
            tracker.view_history(limit)

        elif choice == "3":
            name = input("\nRoutine name: ").strip()
            if not name:
                print("Routine name cannot be empty")
                continue

            print("Enter exercises (one per line, empty line to finish):")
            exercises = []
            while True:
                exercise = input(f"  Exercise {len(exercises) + 1}: ").strip()
                if not exercise:
                    break
                exercises.append(exercise)

            if exercises:
                tracker.create_routine(name, exercises)
            else:
                print("No exercises added.")

        elif choice == "4":
            tracker.list_routines()

        elif choice == "5":
            exercise = input("\nEnter exercise name: ").strip()
            if exercise:
                tracker.view_progress(exercise)

        elif choice == "6":
            tracker.get_stats()

        elif choice == "7":
            print("\n💪 Keep up the good work! Goodbye!\n")
            break

        else:
            print("Invalid option. Please select 1-7.")


if __name__ == "__main__":
    main()
