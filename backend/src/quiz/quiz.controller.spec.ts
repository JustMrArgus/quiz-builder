import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuestionType } from './dto/create-quiz.dto';

describe('QuizController', () => {
  let controller: QuizController;

  const mockQuizService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        {
          provide: QuizService,
          useValue: mockQuizService,
        },
      ],
    }).compile();

    controller = module.get<QuizController>(QuizController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a quiz', async () => {
      const createQuizDto = {
        title: 'Test Quiz',
        questions: [
          {
            text: 'Test question',
            type: QuestionType.BOOLEAN,
            options: ['True', 'False'],
            correctAnswers: ['True'],
          },
        ],
      };

      const expectedResult = {
        id: '1',
        ...createQuizDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockQuizService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createQuizDto);

      expect(result).toEqual(expectedResult);
      expect(mockQuizService.create).toHaveBeenCalledWith(createQuizDto);
    });
  });

  describe('findAll', () => {
    it('should return all quizzes', async () => {
      const expectedResult = [
        { id: '1', title: 'Quiz 1', questionCount: 5 },
        { id: '2', title: 'Quiz 2', questionCount: 3 },
      ];

      mockQuizService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockQuizService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a quiz by id', async () => {
      const expectedResult = {
        id: '1',
        title: 'Test Quiz',
        questions: [],
      };

      mockQuizService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(mockQuizService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('remove', () => {
    it('should delete a quiz', async () => {
      const expectedResult = { message: 'Quiz deleted successfully' };

      mockQuizService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('1');

      expect(result).toEqual(expectedResult);
      expect(mockQuizService.remove).toHaveBeenCalledWith('1');
    });
  });
});
