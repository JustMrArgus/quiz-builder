import { getQuizzes, getQuiz, createQuiz, deleteQuiz } from "../lib/api";
import { QuestionType, CreateQuizInput } from "../lib/types";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("API Functions", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("getQuizzes", () => {
    it("should fetch all quizzes successfully", async () => {
      const mockQuizzes = [
        { id: "1", title: "Quiz 1", questionCount: 5, createdAt: "2024-01-01" },
        { id: "2", title: "Quiz 2", questionCount: 3, createdAt: "2024-01-02" },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuizzes,
      });

      const result = await getQuizzes();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/quizzes"),
        expect.objectContaining({ cache: "no-store" }),
      );
      expect(result).toEqual(mockQuizzes);
    });

    it("should throw error when fetch fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Server error" }),
      });

      await expect(getQuizzes()).rejects.toThrow("Server error");
    });

    it("should throw generic error when no message provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(getQuizzes()).rejects.toThrow("An error occurred");
    });
  });

  describe("getQuiz", () => {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuiz,
      });

      const result = await getQuiz("test-id");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/quizzes/test-id"),
        expect.objectContaining({ cache: "no-store" }),
      );
      expect(result).toEqual(mockQuiz);
    });

    it("should throw error for non-existent quiz", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Quiz not found" }),
      });

      await expect(getQuiz("non-existent")).rejects.toThrow("Quiz not found");
    });
  });

  describe("createQuiz", () => {
    it("should create a new quiz successfully", async () => {
      const input: CreateQuizInput = {
        title: "New Quiz",
        questions: [
          {
            text: "Is this a test?",
            type: QuestionType.BOOLEAN,
            options: ["True", "False"],
            correctAnswers: ["True"],
          },
        ],
      };

      const mockResponse = {
        id: "new-id",
        ...input,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
        questions: input.questions.map((q, i) => ({
          ...q,
          id: `q${i}`,
          order: i,
        })),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createQuiz(input);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/quizzes"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }),
      );
      expect(result.id).toBe("new-id");
      expect(result.title).toBe("New Quiz");
    });

    it("should throw error when creation fails", async () => {
      const input: CreateQuizInput = {
        title: "",
        questions: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Validation failed" }),
      });

      await expect(createQuiz(input)).rejects.toThrow("Validation failed");
    });
  });

  describe("deleteQuiz", () => {
    it("should delete a quiz successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      await expect(deleteQuiz("test-id")).resolves.toBeUndefined();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/quizzes/test-id"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });

    it("should throw error when deletion fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Cannot delete quiz" }),
      });

      await expect(deleteQuiz("test-id")).rejects.toThrow("Cannot delete quiz");
    });

    it("should throw generic error when no message provided on delete failure", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await expect(deleteQuiz("test-id")).rejects.toThrow(
        "Failed to delete quiz",
      );
    });
  });
});
