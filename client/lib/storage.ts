import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Filters,
  DEFAULT_FILTERS,
  UserStats,
  SavedQuestion,
  Question,
} from "@/types/question";

const KEYS = {
  FILTERS: "@prepstream:filters",
  STATS: "@prepstream:stats",
  SAVED_QUESTIONS: "@prepstream:saved_questions",
  USER_PREFERENCES: "@prepstream:preferences",
};

const DEFAULT_STATS: UserStats = {
  questionsAttempted: 0,
  correctAnswers: 0,
  currentStreak: 0,
  bestStreak: 0,
  subjectStats: {},
};

export const storage = {
  async getFilters(): Promise<Filters> {
    try {
      const data = await AsyncStorage.getItem(KEYS.FILTERS);
      return data ? JSON.parse(data) : DEFAULT_FILTERS;
    } catch {
      return DEFAULT_FILTERS;
    }
  },

  async setFilters(filters: Filters): Promise<void> {
    await AsyncStorage.setItem(KEYS.FILTERS, JSON.stringify(filters));
  },

  async getStats(): Promise<UserStats> {
    try {
      const data = await AsyncStorage.getItem(KEYS.STATS);
      return data ? JSON.parse(data) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  },

  async updateStats(
    isCorrect: boolean,
    subject: string
  ): Promise<UserStats> {
    const stats = await this.getStats();

    stats.questionsAttempted += 1;

    if (isCorrect) {
      stats.correctAnswers += 1;
      stats.currentStreak += 1;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
    } else {
      stats.currentStreak = 0;
    }

    if (!stats.subjectStats[subject]) {
      stats.subjectStats[subject] = { attempted: 0, correct: 0 };
    }
    stats.subjectStats[subject].attempted += 1;
    if (isCorrect) {
      stats.subjectStats[subject].correct += 1;
    }

    await AsyncStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    return stats;
  },

  async getSavedQuestions(): Promise<SavedQuestion[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SAVED_QUESTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveQuestion(
    question: Question,
    type: "bookmark" | "mistake",
    userAnswer?: number
  ): Promise<void> {
    const saved = await this.getSavedQuestions();
    const exists = saved.find((q) => q.question.id === question.id);
    if (!exists) {
      saved.unshift({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        question,
        savedAt: new Date().toISOString(),
        type,
        userAnswer,
      });
      await AsyncStorage.setItem(KEYS.SAVED_QUESTIONS, JSON.stringify(saved));
    }
  },

  async removeSavedQuestion(id: string): Promise<void> {
    const saved = await this.getSavedQuestions();
    const filtered = saved.filter((q) => q.id !== id);
    await AsyncStorage.setItem(KEYS.SAVED_QUESTIONS, JSON.stringify(filtered));
  },

  async isQuestionSaved(questionId: string): Promise<boolean> {
    const saved = await this.getSavedQuestions();
    return saved.some((q) => q.question.id === questionId);
  },

  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
