"use client";

import Link from "next/link";
import { Trash2, Loader2 } from "lucide-react";
import { useQuizzes, useDeleteQuiz } from "@/lib/hooks/use-quiz";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function QuizzesPage() {
  const { data: quizzes, isLoading, error, refetch } = useQuizzes();
  const deleteQuizMutation = useDeleteQuiz();

  const handleDelete = (id: string) => {
    deleteQuizMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">
          {error instanceof Error ? error.message : "Failed to load quizzes"}
        </p>
        <Button variant="link" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">All Quizzes</h1>
        <Button asChild>
          <Link href="/create">Create New Quiz</Link>
        </Button>
      </div>

      {!quizzes || quizzes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground mb-4">No quizzes found</p>
            <Button variant="link" asChild>
              <Link href="/create">Create your first quiz</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="hover:shadow-lg transition-shadow group"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Link href={`/quizzes/${quiz.id}`} className="flex-1">
                    <CardTitle className="hover:text-primary transition-colors">
                      {quiz.title}
                    </CardTitle>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        disabled={deleteQuizMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 cursor-pointer" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{quiz.title}
                          &quot;? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(quiz.id)}
                          className="bg-destructive text-white text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <CardDescription>
                  Created {new Date(quiz.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">
                  {quiz.questionCount} question
                  {quiz.questionCount !== 1 ? "s" : ""}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
