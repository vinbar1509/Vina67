/**
 * Types for Cakrawala Bahasa 9 - Kurikulum Merdeka
 */

export interface MindMapNode {
  title: string;
  description: string;
  keyPoints: string[];
}

export interface VocabularyWord {
  word: string;
  type: string; // e.g. "Nomina", "Verba", "Adjektiva"
  meaning: string;
  exampleSentence: string;
}

export interface AnnotatedTextSection {
  label: string;
  content: string;
  explanation: string;
  colorClass: string;
}

export interface InteractiveTextAnalysis {
  title: string;
  intro: string;
  sections: AnnotatedTextSection[];
  summaryNote: string;
}

export interface PracticeQuestion {
  id: string;
  type: 'multiple-choice' | 'classify' | 'arrange-order' | 'flashcard';
  question: string;
  stimulusText?: string;
  // For multiple-choice
  options?: string[];
  correctAnswer?: number; // 0-indexed
  explanation: string;
  // For classify (e.g. Fakta vs Opini, Konjungsi Kausalitas vs Kronologis)
  classificationItems?: {
    text: string;
    category: string; // e.g., 'Fakta' or 'Opini'
  }[];
  categories?: string[];
  // For arrange order
  scrambledSteps?: {
    id: string;
    text: string;
    correctOrder: number;
  }[];
  // For flashcard
  term?: string;
  definition?: string;
  hint?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  stimulus?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subtopic: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  theme: string;
  estimatedMinutes: number;
  colorTheme: {
    badge: string;
    accent: string;
    lightBg: string;
    border: string;
  };
  mindMap: MindMapNode[];
  summarySections: {
    heading: string;
    iconName: string;
    paragraphs: string[];
    tips?: string[];
  }[];
  vocabulary: VocabularyWord[];
  interactiveText: InteractiveTextAnalysis;
  practiceQuestions: PracticeQuestion[];
  quizQuestions: QuizQuestion[];
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  classRoom: string;
  readChapters: string[]; // chapter ids marked as read
  reflections: { [chapterId: string]: string };
  practiceScores: {
    [chapterId: string]: {
      completedCount: number;
      totalCount: number;
      scorePercent: number;
    };
  };
  quizResults: {
    [chapterId: string]: {
      score: number;
      total: number;
      passed: boolean; // >= 75
      completedAt: string;
      attempts: number;
      userAnswers: number[];
    };
  };
  badges: string[];
  xp: number;
  teacherNote?: string;
}

export interface ClassStatistics {
  totalStudents: number;
  classAverage: number;
  completionRate: number;
  needRemedialCount: number;
  chapterAverages: { [chapterId: string]: number };
}
