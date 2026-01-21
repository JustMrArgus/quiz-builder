import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold text-foreground mb-4">
        Welcome to Quiz Builder
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        Create custom quizzes with various question types including True/False,
        Short Answer, and Multiple Choice questions.
      </p>
      <div className="flex gap-4">
        <Button size="lg" asChild>
          <Link href="/create">Create a Quiz</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/quizzes">View All Quizzes</Link>
        </Button>
      </div>
    </div>
  );
}
