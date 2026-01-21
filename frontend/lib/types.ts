export enum QuestionType {
  BOOLEAN = "BOOLEAN",
  INPUT = "INPUT",
  CHECKBOX = "CHECKBOX",
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswers: string[];
  order: number;
}

export interface Quiz {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

export interface QuizListItem {
  id: string;
  title: string;
  questionCount: number;
  createdAt: string;
}

export interface CreateQuestionInput {
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswers?: string[];
  order?: number;
}

export interface CreateQuizInput {
  title: string;
  questions: CreateQuestionInput[];
}
