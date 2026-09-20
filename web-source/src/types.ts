export type QuestionType = 'MCQ' | 'VERY_SHORT' | 'Very Short Question';
export type QuizMode = 'TIMED' | 'UNTIMED';
export type MathDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';

export const MATH_CHAPTERS = [
  'Arithmetic',
  'Number System',
  'Algebra',
  'Linear Equations',
  'Quadratic Equations',
  'Exponents',
  'Logarithms',
  'Ratio & Proportion',
  'Percentage',
  'Profit & Loss',
  'Average',
  'Geometry',
  'Coordinate Geometry',
  'Mensuration',
  'Permutation & Combination',
  'Probability',
  'Statistics',
  'Set Theory',
  'Functions',
  'Sequence & Series',
  'Trigonometry',
  'Calculus',
  'Other / Custom Topic'
] as const;

export type MathChapter = (typeof MATH_CHAPTERS)[number];

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[]; // 4 options for MCQ
  correctAnswer: string;
  explanation: string;
  chapter?: string;
  topic?: string;
  difficulty?: string;
}

export interface UserAnswer {
  questionId: number;
  selectedOption?: string;
  textAnswer?: string;
  isCorrect: boolean;
}

export interface QuizResult {
  topic: string;
  questionType: QuestionType;
  mode: QuizMode;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  score: number;
  percentage: number;
  timeTakenSeconds: number;
  questions: QuizQuestion[];
  userAnswers: Record<number, UserAnswer>;
  isMathQuiz?: boolean;
  chapter?: string;
  difficulty?: string;
}

export interface QuizHistoryItem {
  id: string;
  topic: string;
  questionType: string;
  totalQuestions: number;
  score: number;
  percentage: number;
  mode: string;
  timeTakenFormatted: string;
  formattedDate: string;
  questions: QuizQuestion[];
  userAnswers: Record<number, UserAnswer>;
  attemptNumber?: number;
  originalBookmarkId?: string;
}

/**
 * General Quiz Bookmarks
 * Preserves the complete quiz/questions required to retake the SAME quiz.
 */
export interface GeneralQuizBookmark {
  id: string;
  title: string;
  topic: string;
  questionType: QuestionType;
  totalQuestions?: number;
  questionCount?: number;
  mode?: QuizMode;
  questions: QuizQuestion[];
  bookmarkedAt?: string;
  formattedDate?: string;
  timestamp: number;
  originalQuizInfo?: string;
}

/**
 * Math Solution Item (used in Math History and Math Bookmarks)
 */
export interface MathSolution {
  id: string;
  chapter: string;
  topic: string;
  problem: string;
  solutionSteps: string[];
  finalAnswer: string;
  source: 'Typed' | 'Photo' | 'PDF';
  formattedDate: string;
  timestamp: number;
}

/**
 * Math MCQ Bookmark (Type 1)
 */
export interface MathMcqBookmark {
  id: string;
  chapter: string;
  topic: string;
  difficulty: MathDifficulty;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  bookmarkedAt?: string;
  formattedDate?: string;
  timestamp: number;
  originalQuizTitle?: string;
  fullQuizQuestions?: QuizQuestion[]; // For retaking the entire saved math quiz
}

/**
 * Math Solution Bookmark (Type 2)
 */
export interface MathSolutionBookmark {
  id: string;
  chapter: string;
  topic: string;
  problem: string;
  solutionSteps: string[];
  finalAnswer: string;
  source: 'Typed' | 'Photo' | 'PDF';
  bookmarkedAt?: string;
  formattedDate?: string;
  timestamp: number;
}

/**
 * Math History Item (can be a solved problem or a completed Math MCQ quiz attempt)
 */
export interface MathHistoryItem {
  id: string;
  type: 'SOLUTION' | 'MCQ_ATTEMPT';
  chapter: string;
  topic: string;
  problem?: string;
  solutionSteps?: string[];
  finalAnswer?: string;
  source?: 'Typed' | 'Photo' | 'PDF';
  // If MCQ Attempt:
  questionCount?: number;
  correctCount?: number;
  wrongCount?: number;
  unansweredCount?: number;
  score?: number;
  percentage?: number;
  timeTakenFormatted?: string;
  difficulty?: MathDifficulty;
  mode?: QuizMode;
  questions?: QuizQuestion[];
  userAnswers?: Record<number, UserAnswer>;
  formattedDate: string;
  timestamp: number;
}
