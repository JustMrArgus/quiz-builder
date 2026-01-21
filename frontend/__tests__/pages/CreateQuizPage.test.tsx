import * as api from "@/lib/api";
import { QuestionType } from "@/lib/types";

jest.mock("@/lib/api");

const mockedApi = api as jest.Mocked<typeof api>;

describe("Create Quiz - API Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("createQuiz API should be called with correct data", async () => {
    const mockQuiz = {
      id: "new-quiz-id",
      title: "Test Quiz",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
      questions: [
        {
          id: "q1",
          text: "Is this a test?",
          type: QuestionType.BOOLEAN,
          options: ["True", "False"],
          correctAnswers: ["True"],
          order: 0,
        },
      ],
    };

    mockedApi.createQuiz.mockResolvedValueOnce(mockQuiz);

    const result = await api.createQuiz({
      title: "Test Quiz",
      questions: [
        {
          text: "Is this a test?",
          type: QuestionType.BOOLEAN,
          options: ["True", "False"],
          correctAnswers: ["True"],
        },
      ],
    });

    expect(mockedApi.createQuiz).toHaveBeenCalled();
    expect(result.id).toBe("new-quiz-id");
    expect(result.title).toBe("Test Quiz");
  });

  it("createQuiz with multiple questions", async () => {
    const mockQuiz = {
      id: "quiz-2",
      title: "Multi-Question Quiz",
      createdAt: "2024-01-02",
      updatedAt: "2024-01-02",
      questions: [
        {
          id: "q1",
          text: "Question 1?",
          type: QuestionType.BOOLEAN,
          options: ["True", "False"],
          correctAnswers: ["True"],
          order: 0,
        },
        {
          id: "q2",
          text: "Question 2?",
          type: QuestionType.INPUT,
          options: [],
          correctAnswers: ["answer"],
          order: 1,
        },
        {
          id: "q3",
          text: "Question 3?",
          type: QuestionType.CHECKBOX,
          options: ["A", "B", "C"],
          correctAnswers: ["A", "C"],
          order: 2,
        },
      ],
    };

    mockedApi.createQuiz.mockResolvedValueOnce(mockQuiz);

    const result = await api.createQuiz({
      title: "Multi-Question Quiz",
      questions: [
        {
          text: "Question 1?",
          type: QuestionType.BOOLEAN,
          options: ["True", "False"],
          correctAnswers: ["True"],
        },
        {
          text: "Question 2?",
          type: QuestionType.INPUT,
          options: [],
          correctAnswers: ["answer"],
        },
        {
          text: "Question 3?",
          type: QuestionType.CHECKBOX,
          options: ["A", "B", "C"],
          correctAnswers: ["A", "C"],
        },
      ],
    });

    expect(mockedApi.createQuiz).toHaveBeenCalledTimes(1);
    expect(result.questions).toHaveLength(3);
    expect(result.questions[0].type).toBe(QuestionType.BOOLEAN);
    expect(result.questions[1].type).toBe(QuestionType.INPUT);
    expect(result.questions[2].type).toBe(QuestionType.CHECKBOX);
  });

  it("handles API error when creating quiz", async () => {
    mockedApi.createQuiz.mockRejectedValueOnce(new Error("Network error"));

    await expect(
      api.createQuiz({
        title: "Failed Quiz",
        questions: [],
      }),
    ).rejects.toThrow("Network error");
  });
});
