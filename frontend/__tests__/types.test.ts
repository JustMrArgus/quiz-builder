import {
  QuestionType,
  Quiz,
  QuizListItem,
  CreateQuizInput,
} from "../lib/types";

describe("Types", () => {
  describe("QuestionType", () => {
    it("should have BOOLEAN type", () => {
      expect(QuestionType.BOOLEAN).toBe("BOOLEAN");
    });

    it("should have INPUT type", () => {
      expect(QuestionType.INPUT).toBe("INPUT");
    });

    it("should have CHECKBOX type", () => {
      expect(QuestionType.CHECKBOX).toBe("CHECKBOX");
    });
  });

  describe("Quiz type structure", () => {
    it("should create a valid Quiz object", () => {
      const quiz: Quiz = {
        id: "1",
        title: "Test Quiz",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
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

      expect(quiz.id).toBe("1");
      expect(quiz.title).toBe("Test Quiz");
      expect(quiz.questions).toHaveLength(1);
      expect(quiz.questions[0].type).toBe(QuestionType.BOOLEAN);
    });
  });

  describe("QuizListItem type structure", () => {
    it("should create a valid QuizListItem object", () => {
      const quizItem: QuizListItem = {
        id: "1",
        title: "Test Quiz",
        questionCount: 5,
        createdAt: "2024-01-01T00:00:00Z",
      };

      expect(quizItem.questionCount).toBe(5);
    });
  });

  describe("CreateQuizInput type structure", () => {
    it("should create a valid CreateQuizInput object", () => {
      const input: CreateQuizInput = {
        title: "New Quiz",
        questions: [
          {
            text: "Question 1",
            type: QuestionType.INPUT,
          },
          {
            text: "Question 2",
            type: QuestionType.CHECKBOX,
            options: ["A", "B", "C"],
            correctAnswers: ["A", "C"],
          },
        ],
      };

      expect(input.title).toBe("New Quiz");
      expect(input.questions).toHaveLength(2);
    });
  });
});
