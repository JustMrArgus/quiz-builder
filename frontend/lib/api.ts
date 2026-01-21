import { Quiz, QuizListItem, CreateQuizInput } from "./types";

const getApiUrl = () => {
  if (typeof window === "undefined") {
    return (
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000/api"
    );
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "An error occurred");
  }
  return response.json() as Promise<T>;
};

export const getQuizzes = async (): Promise<QuizListItem[]> => {
  const response = await fetch(`${getApiUrl()}/quizzes`, {
    cache: "no-store",
  });
  return handleResponse<QuizListItem[]>(response);
};

export const getQuiz = async (id: string): Promise<Quiz> => {
  const response = await fetch(`${getApiUrl()}/quizzes/${id}`, {
    cache: "no-store",
  });
  return handleResponse<Quiz>(response);
};

export const createQuiz = async (data: CreateQuizInput): Promise<Quiz> => {
  const response = await fetch(`${getApiUrl()}/quizzes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Quiz>(response);
};

export const deleteQuiz = async (id: string): Promise<void> => {
  const response = await fetch(`${getApiUrl()}/quizzes/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to delete quiz");
  }
};
