export type ExamType = "JEE" | "NEET";
export type Subject = "Physics" | "Chemistry" | "Maths" | "Biology" | "Mix";
export type Language =
  | "English"
  | "Hindi"
  | "Gujarati"
  | "Marathi"
  | "Bengali"
  | "Tamil"
  | "Telugu"
  | "Kannada"
  | "Malayalam"
  | "Punjabi"
  | "Assamese"
  | "Odia"
  | "Urdu";

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  solution: string;
  subject: Subject | string;
  type: ExamType;
  difficulty: number;
  isAiGenerated: boolean;
}

export interface Filters {
  exam: ExamType;
  difficulty: number;
  subject: Subject;
  language: Language;
}

export interface UserStats {
  questionsAttempted: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
  subjectStats: {
    [key: string]: {
      attempted: number;
      correct: number;
    };
  };
}

export interface SavedQuestion {
  id: string;
  question: Question;
  savedAt: string;
  type: "bookmark" | "mistake";
  userAnswer?: number;
}

export const EXAM_TYPES: ExamType[] = ["JEE", "NEET"];

export const SUBJECTS: { [key in ExamType]: Subject[] } = {
  JEE: ["Physics", "Chemistry", "Maths"],
  NEET: ["Physics", "Chemistry", "Biology"],
};

export const LANGUAGES: Language[] = [
  "English",
  "Hindi",
  "Gujarati",
  "Marathi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Assamese",
  "Odia",
  "Urdu",
];

export const DEFAULT_FILTERS: Filters = {
  exam: "JEE",
  difficulty: 3,
  subject: "Mix",
  language: "English",
};
