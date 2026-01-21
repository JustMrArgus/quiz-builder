import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import {
  useQuizzes,
  useQuiz,
  useCreateQuiz,
  useDeleteQuiz,
  quizKeys,
} from "../lib/hooks/use-quiz";
import * as api from "../lib/api";
import { QuestionType } from "../lib/types";

jest.mock("../lib/api");

const mockedApi = api as jest.Mocked<typeof api>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("Quiz Hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("quizKeys", () => {
    it("should generate correct query keys", () => {
      expect(quizKeys.all).toEqual(["quizzes"]);
      expect(quizKeys.lists()).toEqual(["quizzes", "list"]);
      expect(quizKeys.list()).toEqual(["quizzes", "list"]);
      expect(quizKeys.details()).toEqual(["quizzes", "detail"]);
      expect(quizKeys.detail("123")).toEqual(["quizzes", "detail", "123"]);
    });
  });

  describe("useQuizzes", () => {
    it("should fetch quizzes successfully", async () => {
      const mockQuizzes = [
        { id: "1", title: "Quiz 1", questionCount: 5, createdAt: "2024-01-01" },
        { id: "2", title: "Quiz 2", questionCount: 3, createdAt: "2024-01-02" },
      ];

      mockedApi.getQuizzes.mockResolvedValueOnce(mockQuizzes);

      const { result } = renderHook(() => useQuizzes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockQuizzes);
      expect(mockedApi.getQuizzes).toHaveBeenCalledTimes(1);
    });

    it("should handle error state", async () => {
      mockedApi.getQuizzes.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useQuizzes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Network error");
    });

    it("should show loading state initially", () => {
      mockedApi.getQuizzes.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useQuizzes(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("useQuiz", () => {
    it("should fetch a single quiz by id", async () => {
      const mockQuiz = {
        id: "test-id",
        title: "Test Quiz",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        questions: [
          {
            id: "q1",
            text: "Question 1",
            type: QuestionType.BOOLEAN,
            options: ["True", "False"],
            correctAnswers: ["True"],
            order: 0,
          },
        ],
      };

      mockedApi.getQuiz.mockResolvedValueOnce(mockQuiz);

      const { result } = renderHook(() => useQuiz("test-id"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockQuiz);
      expect(mockedApi.getQuiz).toHaveBeenCalledWith("test-id");
    });

    it("should not fetch when id is empty", () => {
      const { result } = renderHook(() => useQuiz(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockedApi.getQuiz).not.toHaveBeenCalled();
    });

    it("should handle quiz not found error", async () => {
      mockedApi.getQuiz.mockRejectedValueOnce(new Error("Quiz not found"));

      const { result } = renderHook(() => useQuiz("non-existent"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Quiz not found");
    });
  });

  describe("useCreateQuiz", () => {
    it("should create a quiz successfully", async () => {
      const input = {
        title: "New Quiz",
        questions: [
          {
            text: "Question 1",
            type: QuestionType.INPUT,
          },
        ],
      };

      const mockResponse = {
        id: "new-id",
        title: "New Quiz",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        questions: [
          {
            id: "q1",
            text: "Question 1",
            type: QuestionType.INPUT,
            options: [],
            correctAnswers: [],
            order: 0,
          },
        ],
      };

      mockedApi.createQuiz.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCreateQuiz(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(input);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(mockedApi.createQuiz).toHaveBeenCalledWith(input);
    });

    it("should handle creation error", async () => {
      mockedApi.createQuiz.mockRejectedValueOnce(
        new Error("Validation failed"),
      );

      const { result } = renderHook(() => useCreateQuiz(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ title: "", questions: [] });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Validation failed");
    });
  });

  describe("useDeleteQuiz", () => {
    it("should delete a quiz successfully", async () => {
      mockedApi.deleteQuiz.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteQuiz(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("quiz-to-delete");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedApi.deleteQuiz).toHaveBeenCalledWith("quiz-to-delete");
    });

    it("should handle deletion error", async () => {
      mockedApi.deleteQuiz.mockRejectedValueOnce(
        new Error("Cannot delete quiz"),
      );

      const { result } = renderHook(() => useDeleteQuiz(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("quiz-id");

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe("Cannot delete quiz");
    });
  });
});
