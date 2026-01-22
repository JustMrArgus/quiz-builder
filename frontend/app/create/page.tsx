"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, X } from "lucide-react";
import { useCreateQuiz } from "@/lib/hooks/use-quiz";
import { QuestionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const questionSchema = z
  .object({
    text: z.string().min(1, "Question text is required"),
    type: z.nativeEnum(QuestionType),
    options: z.array(z.string()).optional(),
    correctAnswers: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      const answers = data.correctAnswers || [];
      return answers.length > 0 && answers.some((a) => a.trim() !== "");
    },
    {
      message: "At least one correct answer is required",
      path: ["correctAnswers"],
    },
  );

const quizSchema = z.object({
  title: z.string().min(1, "Quiz title is required"),
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});

type QuizFormData = z.infer<typeof quizSchema>;

export default function CreateQuizPage() {
  const router = useRouter();
  const createQuizMutation = useCreateQuiz();

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      questions: [
        {
          text: "",
          type: QuestionType.BOOLEAN,
          options: ["True", "False"],
          correctAnswers: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const watchQuestions = form.watch("questions");

  const addQuestion = () => {
    append({
      text: "",
      type: QuestionType.BOOLEAN,
      options: ["True", "False"],
      correctAnswers: [],
    });
  };

  const handleTypeChange = (index: number, type: QuestionType) => {
    form.setValue(`questions.${index}.type`, type);
    if (type === QuestionType.BOOLEAN) {
      form.setValue(`questions.${index}.options`, ["True", "False"]);
    } else if (type === QuestionType.CHECKBOX) {
      form.setValue(`questions.${index}.options`, ["Option 1", "Option 2"]);
    } else {
      form.setValue(`questions.${index}.options`, []);
    }
    form.setValue(`questions.${index}.correctAnswers`, []);
  };

  const addOption = (questionIndex: number) => {
    const currentOptions = watchQuestions[questionIndex]?.options || [];
    let optionNum = currentOptions.length + 1;
    let newOptionName = `Option ${optionNum}`;
    while (currentOptions.includes(newOptionName)) {
      optionNum++;
      newOptionName = `Option ${optionNum}`;
    }
    form.setValue(`questions.${questionIndex}.options`, [
      ...currentOptions,
      newOptionName,
    ]);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions = watchQuestions[questionIndex]?.options || [];
    const removedOption = currentOptions[optionIndex];
    const newOptions = currentOptions.filter((_, i) => i !== optionIndex);
    form.setValue(`questions.${questionIndex}.options`, newOptions);

    const currentCorrect = watchQuestions[questionIndex]?.correctAnswers || [];
    form.setValue(
      `questions.${questionIndex}.correctAnswers`,
      currentCorrect.filter((a) => a !== removedOption),
    );
  };

  const toggleCorrectAnswer = (questionIndex: number, answer: string) => {
    const question = watchQuestions[questionIndex];
    const currentCorrect = question?.correctAnswers || [];

    if (question?.type === QuestionType.BOOLEAN) {
      form.setValue(`questions.${questionIndex}.correctAnswers`, [answer]);
    } else {
      if (currentCorrect.includes(answer)) {
        form.setValue(
          `questions.${questionIndex}.correctAnswers`,
          currentCorrect.filter((a) => a !== answer),
        );
      } else {
        form.setValue(`questions.${questionIndex}.correctAnswers`, [
          ...currentCorrect,
          answer,
        ]);
      }
    }
  };

  const onSubmit = async (data: QuizFormData) => {
    try {
      const quiz = await createQuizMutation.mutateAsync({
        title: data.title,
        questions: data.questions.map((q, index) => ({
          text: q.text,
          type: q.type,
          options: q.options || [],
          correctAnswers: q.correctAnswers || [],
          order: index,
        })),
      });
      router.push(`/quizzes/${quiz.id}`);
    } catch {}
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Create New Quiz
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
              <CardDescription>
                Give your quiz a descriptive title
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter quiz title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">
                Questions
              </h2>
              <Button type="button" onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      Question {index + 1}
                    </CardTitle>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 " />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`questions.${index}.text`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question Text</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your question..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select
                      value={watchQuestions[index]?.type}
                      onValueChange={(value) =>
                        handleTypeChange(index, value as QuestionType)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={QuestionType.BOOLEAN}>
                          True/False
                        </SelectItem>
                        <SelectItem value={QuestionType.INPUT}>
                          Short Answer
                        </SelectItem>
                        <SelectItem value={QuestionType.CHECKBOX}>
                          Multiple Choice
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {watchQuestions[index]?.type === QuestionType.BOOLEAN && (
                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <RadioGroup
                        value={watchQuestions[index]?.correctAnswers?.[0] || ""}
                        onValueChange={(value) =>
                          toggleCorrectAnswer(index, value)
                        }
                        className="flex gap-6"
                      >
                        {["True", "False"].map((option) => (
                          <div
                            key={option}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={option}
                              id={`q${index}-${option}`}
                            />
                            <Label htmlFor={`q${index}-${option}`}>
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {watchQuestions[index]?.type === QuestionType.INPUT && (
                    <div className="space-y-2">
                      <Label>Expected Answer</Label>
                      <Input
                        value={watchQuestions[index]?.correctAnswers?.[0] || ""}
                        onChange={(e) =>
                          form.setValue(`questions.${index}.correctAnswers`, [
                            e.target.value,
                          ])
                        }
                        placeholder="Enter expected answer..."
                      />
                    </div>
                  )}

                  {watchQuestions[index]?.type === QuestionType.CHECKBOX && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Options (check correct answers)</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(index)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {watchQuestions[index]?.options?.map(
                          (option, optIndex) => (
                            <div
                              key={`${index}-opt-${optIndex}-${option}`}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                checked={watchQuestions[
                                  index
                                ]?.correctAnswers?.includes(option)}
                                onCheckedChange={() =>
                                  toggleCorrectAnswer(index, option)
                                }
                              />
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [
                                    ...(watchQuestions[index]?.options || []),
                                  ];
                                  const oldOption = newOptions[optIndex];
                                  newOptions[optIndex] = e.target.value;
                                  form.setValue(
                                    `questions.${index}.options`,
                                    newOptions,
                                  );

                                  const currentCorrect =
                                    watchQuestions[index]?.correctAnswers || [];
                                  if (currentCorrect.includes(oldOption)) {
                                    form.setValue(
                                      `questions.${index}.correctAnswers`,
                                      currentCorrect.map((a) =>
                                        a === oldOption ? e.target.value : a,
                                      ),
                                    );
                                  }
                                }}
                                className="flex-1"
                              />
                              {(watchQuestions[index]?.options?.length || 0) >
                                2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeOption(index, optIndex)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {form.formState.errors.questions?.[index]?.correctAnswers && (
                    <p className="text-destructive text-sm">
                      {
                        form.formState.errors.questions[index]?.correctAnswers
                          ?.message
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {form.formState.errors.questions &&
            !Array.isArray(form.formState.errors.questions) && (
              <p className="text-destructive text-sm">
                {form.formState.errors.questions.message}
              </p>
            )}

          {createQuizMutation.error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-destructive">
                  {createQuizMutation.error instanceof Error
                    ? createQuizMutation.error.message
                    : "Failed to create quiz"}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createQuizMutation.isPending}>
              {createQuizMutation.isPending ? "Creating..." : "Create Quiz"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
