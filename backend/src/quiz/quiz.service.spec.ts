import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from './quiz.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { QuestionType } from './dto/create-quiz.dto';

describe('QuizService', () => {
  let service: QuizService;

  const mockPrismaService = {
    quiz: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a quiz with questions', async () => {
      const createQuizDto = {
        title: 'Test Quiz',
        questions: [
          {
            text: 'Is TypeScript a superset of JavaScript?',
            type: QuestionType.BOOLEAN,
            options: ['True', 'False'],
            correctAnswers: ['True'],
          },
        ],
      };

      const expectedResult = {
        id: '1',
        title: 'Test Quiz',
        createdAt: new Date(),
        updatedAt: new Date(),
        questions: [
          {
            id: '1',
            text: 'Is TypeScript a superset of JavaScript?',
            type: 'BOOLEAN',
            options: ['True', 'False'],
            correctAnswers: ['True'],
            quizId: '1',
            order: 0,
          },
        ],
      };

      mockPrismaService.quiz.create.mockResolvedValue(expectedResult);

      const result = await service.create(createQuizDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.quiz.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Quiz',
          questions: {
            create: [
              {
                text: 'Is TypeScript a superset of JavaScript?',
                type: QuestionType.BOOLEAN,
                options: ['True', 'False'],
                correctAnswers: ['True'],
                order: 0,
              },
            ],
          },
        },
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all quizzes with question count', async () => {
      const mockQuizzes = [
        {
          id: '1',
          title: 'Quiz 1',
          createdAt: new Date(),
          _count: { questions: 5 },
        },
        {
          id: '2',
          title: 'Quiz 2',
          createdAt: new Date(),
          _count: { questions: 3 },
        },
      ];

      mockPrismaService.quiz.findMany.mockResolvedValue(mockQuizzes);

      const result = await service.findAll();

      expect(result).toEqual([
        {
          id: '1',
          title: 'Quiz 1',
          questionCount: 5,
          createdAt: mockQuizzes[0].createdAt,
        },
        {
          id: '2',
          title: 'Quiz 2',
          questionCount: 3,
          createdAt: mockQuizzes[1].createdAt,
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return a quiz by id', async () => {
      const mockQuiz = {
        id: '1',
        title: 'Test Quiz',
        createdAt: new Date(),
        updatedAt: new Date(),
        questions: [],
      };

      mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);

      const result = await service.findOne('1');

      expect(result).toEqual(mockQuiz);
    });

    it('should throw NotFoundException if quiz not found', async () => {
      mockPrismaService.quiz.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a quiz', async () => {
      const mockQuiz = { id: '1', title: 'Test Quiz' };

      mockPrismaService.quiz.findUnique.mockResolvedValue(mockQuiz);
      mockPrismaService.quiz.delete.mockResolvedValue(mockQuiz);

      const result = await service.remove('1');

      expect(result).toEqual({ message: 'Quiz deleted successfully' });
      expect(mockPrismaService.quiz.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if quiz not found', async () => {
      mockPrismaService.quiz.findUnique.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
