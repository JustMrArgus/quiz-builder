import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuizDto: CreateQuizDto) {
    const { title, questions } = createQuizDto;

    return this.prisma.quiz.create({
      data: {
        title,
        questions: {
          create: questions.map((q, index) => ({
            text: q.text,
            type: q.type,
            options: q.options || [],
            correctAnswers: q.correctAnswers || [],
            order: q.order ?? index,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findAll() {
    const quizzes = await this.prisma.quiz.findMany({
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      questionCount: quiz._count.questions,
      createdAt: quiz.createdAt,
    }));
  }

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID "${id}" not found`);
    }

    return quiz;
  }

  async remove(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID "${id}" not found`);
    }

    await this.prisma.quiz.delete({
      where: { id },
    });

    return { message: 'Quiz deleted successfully' };
  }
}
