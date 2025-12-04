/**
 * Habit Hero Logic Tests
 * Uses Jest as the test runner
 */

import {
  getFrequencyDays,
  isHabitDoneThisPeriod,
  getNextDueDate
} from "../src/HabitHero"; // adjust path based on your structure

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
