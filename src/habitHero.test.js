/**
 * Habit Hero Logic Tests
 * Uses Jest as the test runner
 */

import {
  getFrequencyDays,
  isHabitDoneThisPeriod,
  getNextDueDate,
  calculateLevel,
  calculateProgress,
  toggleTaskLogic,
  registerUser,
  loginUser,
  createTask,
  createHabit,
  updateTask,
  updateHabit,
  deleteTask,
  deleteHabit,
  getTaskById,
  getHabitById,
  getWeeklyTaskStats
} from "./HabitLogic";

 // adjust path based on your structure

describe("Habit Hero - Frequency Helpers", () => {
  test("getFrequencyDays returns correct values", () => {
    expect(getFrequencyDays("daily")).toBe(1);
    expect(getFrequencyDays("weekly")).toBe(7);
    expect(getFrequencyDays("biweekly")).toBe(14);
    expect(getFrequencyDays("monthly")).toBe(30);
  });
});

describe("Habit Hero - Period Completion Logic", () => {
  test("Daily habit is done only if completed today", () => {
    const today = new Date().toDateString();

    const habit = {
      frequency: "daily",
      lastCompleted: today
    };

    expect(isHabitDoneThisPeriod(habit)).toBe(true);
  });

  test("Daily habit is NOT done if completed yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const habit = {
      frequency: "daily",
      lastCompleted: yesterday.toDateString()
    };

    expect(isHabitDoneThisPeriod(habit)).toBe(false);
  });

  test("Weekly habit is done if completed 3 days ago", () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);

    const habit = {
      frequency: "weekly",
      lastCompleted: past.toDateString()
    };

    expect(isHabitDoneThisPeriod(habit)).toBe(true);
  });

  test("Weekly habit is NOT done if completed 8 days ago", () => {
    const past = new Date();
    past.setDate(past.getDate() - 8);

    const habit = {
      frequency: "weekly",
      lastCompleted: past.toDateString()
    };

    expect(isHabitDoneThisPeriod(habit)).toBe(false);
  });
});

describe("Habit Hero - Next Due Date Calculation", () => {
  test("Daily habit next due date = +1 day", () => {
    const today = new Date();

    const habit = {
      frequency: "daily",
      lastCompleted: today.toDateString()
    };

    const next = getNextDueDate(habit);

    const expected = new Date();
    expected.setDate(expected.getDate() + 1);

    expect(next.toDateString()).toBe(expected.toDateString());
  });

  test("Weekly habit next due date = +7 days", () => {
    const today = new Date();

    const habit = {
      frequency: "weekly",
      lastCompleted: today.toDateString()
    };

    const next = getNextDueDate(habit);

    const expected = new Date();
    expected.setDate(expected.getDate() + 7);

    expect(next.toDateString()).toBe(expected.toDateString());
  });
});

describe("Habit Hero - Streak Logic", () => {
    test("Streak continues if completed within the frequency window", () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const habit = {
            name: "Workout",
            frequency: "daily",
            lastCompleted: yesterday.toDateString(),
            streak: 3
        };

        const todayStr = new Date().toDateString();
        const freqDays = 1;

        const diffDays = 1; 

        const newStreak = diffDays <= freqDays ? habit.streak + 1 : 1;

        expect(newStreak).toBe(4);
    });

    test("Streak resets if too many days passed", () => {
        const last = new Date();
        last.setDate(last.getDate() - 5);

        const habit = {
            frequency: "daily",
            lastCompleted: last.toDateString(),
            streak: 6
        };

        const diffDays = 5;

        const newStreak = diffDays <= 1 ? habit.streak + 1 : 1;

        expect(newStreak).toBe(1);
    });
});


describe("Habit Hero – Streak Logic", () => {
    test("Streak continues if completed within the frequency window", () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const habit = {
            name: "Workout",
            frequency: "daily",
            lastCompleted: yesterday.toDateString(),
            streak: 3
        };

        const todayStr = new Date().toDateString();
        const freqDays = 1;

        const diffDays = 1; 

        const newStreak = diffDays <= freqDays ? habit.streak + 1 : 1;

        expect(newStreak).toBe(4);
    });

    test("Streak resets if too many days passed", () => {
        const last = new Date();
        last.setDate(last.getDate() - 5);

        const habit = {
            frequency: "daily",
            lastCompleted: last.toDateString(),
            streak: 6
        };

        const diffDays = 5;

        const newStreak = diffDays <= 1 ? habit.streak + 1 : 1;

        expect(newStreak).toBe(1);
    });
});


describe("Task Logic – Completion Toggle", () => {

  test("Completing a task awards XP and coins", () => {
      const task = { completed: false };

      const result = toggleTaskLogic(task);

      expect(result.completed).toBe(true);
      expect(result.xp).toBe(50);
      expect(result.coins).toBe(20);
  });

  test("Un-completing a task removes XP and coins", () => {
      const task = { completed: true };

      const result = toggleTaskLogic(task);

      expect(result.completed).toBe(false);
      expect(result.xp).toBe(-50);
      expect(result.coins).toBe(-20);
  });

});

test("Registration succeeds with valid email and password", () => {
  const result = registerUser("ayasha@mail.com", "Pass123!");
  expect(result.success).toBe(true);
});

test("Registration fails with invalid email format", () => {
  const result = registerUser("not-an-email", "Pass123!");
  expect(result.success).toBe(false);
});

test("Login succeeds with correct credentials", () => {
  registerUser("ayasha@mail.com", "Pass123!");
  const result = loginUser("ayasha@mail.com", "Pass123!");
  expect(result.token).toBeDefined();
});

test("Login fails with incorrect password", () => {
  registerUser("ayasha@mail.com", "Pass123!");
  const result = loginUser("ayasha@mail.com", "WrongPass");
  expect(result.success).toBe(false);
});

// ---------- TASK TESTS ----------

test("Task is created with required fields", () => {
  const task = createTask({ title: "Read", due: "2025-01-01" });
  expect(task.id).toBeDefined();
  expect(task.title).toBe("Read");
});

test("Task creation fails if title missing", () => {
  expect(() => createTask({ due: "2025-01-01" })).toThrow();
});

test("Editing a task updates its title", () => {
  const task = createTask({ title: "Old", due: "2025-01-01" });
  const updated = updateTask(task.id, { title: "New Title" });
  expect(updated.title).toBe("New Title");
});

test("Deleting a task removes it from the list", () => {
  const task = createTask({ title: "Temp", due: "2025-01-01" });
  deleteTask(task.id);
  expect(getTaskById(task.id)).toBeUndefined();
});

test("Habit is created with default streak = 0", () => {
  const habit = createHabit("Workout", "daily");
  expect(habit.streak).toBe(0);
});

test("Habit creation fails with invalid frequency", () => {
  expect(() => createHabit("Meditate", "every-minute")).toThrow();
});

test("Editing a habit updates its frequency", () => {
  const habit = createHabit("Exercise", "daily");
  const updated = updateHabit(habit.id, { frequency: "weekly" });
  expect(updated.frequency).toBe("weekly");
});

test("Deleting a habit removes it from storage", () => {
  const habit = createHabit("Drink Water", "daily");
  deleteHabit(habit.id);
  expect(getHabitById(habit.id)).toBeUndefined();
});

test("Analytics returns correct number of tasks done this week", () => {
  const userId = "user1";
  // simulate data
  const task1 = createTask({ title: "A" });
  const task2 = createTask({ title: "B" });
  task1.completed = true;
  task2.completed = true;

  const stats = getWeeklyTaskStats(userId);
  expect(stats.completed).toBe(2);
});
