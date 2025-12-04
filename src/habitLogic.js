// habitLogic.js

// Convert string or timestamp to JS Date
export const toJsDate = (value) => {
  if (!value) return null;
  if (typeof value === "string") return new Date(value);
  if (value.toDate) return value.toDate();
  return new Date(value);
};

// Frequency in days
export const getFrequencyDays = (frequency) => {
  switch (frequency) {
    case "weekly":
      return 7;
    case "biweekly":
      return 14;
    case "monthly":
      return 30;
    default:
      return 1; // daily
  }
};

// Check if habit already done this period
export const isHabitDoneThisPeriod = (habit) => {
  const freq = habit.frequency || "daily";
  const last = habit.lastCompleted ? new Date(habit.lastCompleted) : null;
  if (!last) return false;

  const now = new Date();
  const diffDays = (now - last) / (1000 * 60 * 60 * 24);

  if (freq === "daily") {
    return now.toDateString() === last.toDateString();
  }

  const freqDays = getFrequencyDays(freq);
  return diffDays >= 0 && diffDays < freqDays;
};

// Calculate next due date
export const getNextDueDate = (habit) => {
  const freq = habit.frequency || "daily";
  const freqDays = getFrequencyDays(freq);

  const base = habit.lastCompleted
    ? new Date(habit.lastCompleted)
    : toJsDate(habit.createdAt) || new Date();

  const next = new Date(base);
  next.setDate(next.getDate() + freqDays);
  return next;
};

// XP → Level
export const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;

// XP → Percentage to next level
export const calculateProgress = (xp = 0) => {
  const level = calculateLevel(xp);
  const currentXp = 100 * Math.pow(level - 1, 2);
  const nextXp = 100 * Math.pow(level, 2);
  return Math.min(
    100,
    Math.max(0, ((xp - currentXp) / (nextXp - currentXp)) * 100)
  );
};

// Task toggle logic (no Firebase)
export const toggleTaskLogic = (task) => {
  const completed = !task.completed;
  return {
    completed,
    xp: completed ? 50 : -50,
    coins: completed ? 20 : -20,
  };
};
