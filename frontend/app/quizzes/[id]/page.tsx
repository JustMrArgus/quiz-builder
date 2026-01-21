import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { getQuiz } from "@/lib/api";
import { QuestionType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuizDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizDetailPage({ params }: QuizDetailPageProps) {
  const { id } = await params;

  let quiz;
  try {
    quiz = await getQuiz(id);
  } catch {
    notFound();
  }

  const getQuestionTypeLabel = (type: QuestionType) => {
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

  const getQuestionTypeBadgeVariant = (type: QuestionType) => {
    switch (type) {
      case QuestionType.BOOLEAN:
        return "default" as const;
      case QuestionType.INPUT:
        return "secondary" as const;
      case QuestionType.CHECKBOX:
        return "outline" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/quizzes" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Quizzes
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{quiz.title}</CardTitle>
          <p className="text-muted-foreground">
            {quiz.questions.length} question
            {quiz.questions.length !== 1 ? "s" : ""} • Created{" "}
            {new Date(quiz.createdAt).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {quiz.questions.map((question, index) => (
            <Card key={question.id} className="bg-muted/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-lg font-medium">
                    <span className="text-primary mr-2">Q{index + 1}.</span>
                    {question.text}
                  </CardTitle>
                  <Badge variant={getQuestionTypeBadgeVariant(question.type)}>
                    {getQuestionTypeLabel(question.type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {question.type === QuestionType.BOOLEAN && (
                  <RadioGroup
                    disabled
                    defaultValue={question.correctAnswers[0]}
                    className="flex gap-6"
                  >
                    {["True", "False"].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={option}
                          id={`${question.id}-${option}`}
                        />
                        <Label
                          htmlFor={`${question.id}-${option}`}
                          className="flex items-center gap-2"
                        >
                          {option}
                          {question.correctAnswers.includes(option) && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.type === QuestionType.INPUT && (
                  <div className="space-y-2">
                    <Input disabled placeholder="Short answer text..." />
                    {question.correctAnswers.length > 0 && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Expected answer: {question.correctAnswers.join(", ")}
                      </p>
                    )}
                  </div>
                )}

                {question.type === QuestionType.CHECKBOX && (
                  <div className="space-y-3">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          disabled
                          checked={question.correctAnswers.includes(option)}
                          id={`${question.id}-opt-${optIndex}`}
                        />
                        <Label
                          htmlFor={`${question.id}-opt-${optIndex}`}
                          className="flex items-center gap-2"
                        >
                          {option}
                          {question.correctAnswers.includes(option) && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
