import { QuestionType } from "@/lib/types";

describe("QuestionType Utilities", () => {
  describe("Question Type Labels", () => {
    const getQuestionTypeLabel = (type: QuestionType): string => {
      switch (type) {
        case QuestionType.BOOLEAN:
          return "True/False";
        case QuestionType.INPUT:
          return "Short Answer";
        case QuestionType.CHECKBOX:
          return "Multiple Choice";
        default:
          return type;
      }
    };

    it("should return correct label for BOOLEAN type", () => {
      expect(getQuestionTypeLabel(QuestionType.BOOLEAN)).toBe("True/False");
    });

    it("should return correct label for INPUT type", () => {
      expect(getQuestionTypeLabel(QuestionType.INPUT)).toBe("Short Answer");
    });

    it("should return correct label for CHECKBOX type", () => {
      expect(getQuestionTypeLabel(QuestionType.CHECKBOX)).toBe(
        "Multiple Choice",
      );
    });
  });

  describe("Question Validation", () => {
    interface QuestionInput {
      text: string;
      type: QuestionType;
      options?: string[];
      correctAnswers?: string[];
    }

    const validateQuestion = (question: QuestionInput): string[] => {
      const errors: string[] = [];

      if (!question.text || question.text.trim() === "") {
        errors.push("Question text is required");
      }

      if (question.type === QuestionType.CHECKBOX) {
        if (!question.options || question.options.length < 2) {
          errors.push("Multiple choice questions need at least 2 options");
        }
        if (!question.correctAnswers || question.correctAnswers.length === 0) {
          errors.push("At least one correct answer is required");
        }
      }

      if (question.type === QuestionType.BOOLEAN) {
        if (!question.correctAnswers || question.correctAnswers.length !== 1) {
          errors.push("Boolean questions must have exactly one correct answer");
        }
      }

      return errors;
    };

    it("should require question text", () => {
      const errors = validateQuestion({
        text: "",
        type: QuestionType.INPUT,
      });
      expect(errors).toContain("Question text is required");
    });

    it("should validate checkbox questions have options", () => {
      const errors = validateQuestion({
        text: "Select all that apply",
        type: QuestionType.CHECKBOX,
        options: ["A"],
        correctAnswers: ["A"],
      });
      expect(errors).toContain(
        "Multiple choice questions need at least 2 options",
      );
    });

    it("should validate checkbox questions have correct answers", () => {
      const errors = validateQuestion({
        text: "Select all that apply",
        type: QuestionType.CHECKBOX,
        options: ["A", "B", "C"],
        correctAnswers: [],
      });
      expect(errors).toContain("At least one correct answer is required");
    });

    it("should validate boolean questions have one correct answer", () => {
      const errors = validateQuestion({
        text: "Is this correct?",
        type: QuestionType.BOOLEAN,
        correctAnswers: [],
      });
      expect(errors).toContain(
        "Boolean questions must have exactly one correct answer",
      );
    });

    it("should pass validation for valid input question", () => {
      const errors = validateQuestion({
        text: "What is your name?",
        type: QuestionType.INPUT,
      });
      expect(errors).toHaveLength(0);
    });

    it("should pass validation for valid boolean question", () => {
      const errors = validateQuestion({
        text: "Is the sky blue?",
        type: QuestionType.BOOLEAN,
        correctAnswers: ["True"],
      });
      expect(errors).toHaveLength(0);
    });

    it("should pass validation for valid checkbox question", () => {
      const errors = validateQuestion({
        text: "Select the primary colors",
        type: QuestionType.CHECKBOX,
        options: ["Red", "Green", "Blue", "Yellow"],
        correctAnswers: ["Red", "Blue"],
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe("Quiz Score Calculation", () => {
    interface Answer {
      questionId: string;
      answer: string[];
    }

    interface Question {
      id: string;
      type: QuestionType;
      correctAnswers: string[];
    }

    const calculateScore = (
      questions: Question[],
      answers: Answer[],
    ): { correct: number; total: number; percentage: number } => {
      let correct = 0;

      questions.forEach((question) => {
        const userAnswer = answers.find((a) => a.questionId === question.id);

        if (!userAnswer) return;

        const isCorrect =
          question.correctAnswers.length === userAnswer.answer.length &&
          question.correctAnswers.every((ca) => userAnswer.answer.includes(ca));

        if (isCorrect) correct++;
      });

      return {
        correct,
        total: questions.length,
        percentage: Math.round((correct / questions.length) * 100),
      };
    };

    it("should calculate 100% for all correct answers", () => {
      const questions: Question[] = [
        { id: "1", type: QuestionType.BOOLEAN, correctAnswers: ["True"] },
        { id: "2", type: QuestionType.INPUT, correctAnswers: ["Paris"] },
      ];

      const answers: Answer[] = [
        { questionId: "1", answer: ["True"] },
        { questionId: "2", answer: ["Paris"] },
      ];

      const score = calculateScore(questions, answers);
      expect(score.correct).toBe(2);
      expect(score.total).toBe(2);
      expect(score.percentage).toBe(100);
    });

    it("should calculate 0% for all wrong answers", () => {
      const questions: Question[] = [
        { id: "1", type: QuestionType.BOOLEAN, correctAnswers: ["True"] },
        { id: "2", type: QuestionType.BOOLEAN, correctAnswers: ["False"] },
      ];

      const answers: Answer[] = [
        { questionId: "1", answer: ["False"] },
        { questionId: "2", answer: ["True"] },
      ];

      const score = calculateScore(questions, answers);
      expect(score.correct).toBe(0);
      expect(score.percentage).toBe(0);
    });

    it("should calculate 50% for half correct", () => {
      const questions: Question[] = [
        { id: "1", type: QuestionType.BOOLEAN, correctAnswers: ["True"] },
        { id: "2", type: QuestionType.BOOLEAN, correctAnswers: ["False"] },
      ];

      const answers: Answer[] = [
        { questionId: "1", answer: ["True"] },
        { questionId: "2", answer: ["True"] },
      ];

      const score = calculateScore(questions, answers);
      expect(score.correct).toBe(1);
      expect(score.percentage).toBe(50);
    });

    it("should handle checkbox questions with multiple correct answers", () => {
      const questions: Question[] = [
        {
          id: "1",
          type: QuestionType.CHECKBOX,
          correctAnswers: ["Red", "Blue"],
        },
      ];

      const answers: Answer[] = [{ questionId: "1", answer: ["Red", "Blue"] }];

      const score = calculateScore(questions, answers);
      expect(score.correct).toBe(1);
    });

    it("should mark wrong if missing some checkbox answers", () => {
      const questions: Question[] = [
        {
          id: "1",
          type: QuestionType.CHECKBOX,
          correctAnswers: ["Red", "Blue"],
        },
      ];

      const answers: Answer[] = [{ questionId: "1", answer: ["Red"] }];

      const score = calculateScore(questions, answers);
      expect(score.correct).toBe(0);
    });
  });
});
