import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Quiz API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up and close connections
    await prisma.question.deleteMany();
    await prisma.quiz.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.question.deleteMany();
    await prisma.quiz.deleteMany();
  });

  describe('POST /api/quizzes', () => {
    it('should create a quiz with boolean question', async () => {
      const createQuizDto = {
        title: 'JavaScript Basics',
        questions: [
          {
            text: 'Is JavaScript dynamically typed?',
            type: 'BOOLEAN',
            options: ['True', 'False'],
            correctAnswers: ['True'],
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/quizzes')
        .send(createQuizDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('JavaScript Basics');
      expect(response.body.questions).toHaveLength(1);
      expect(response.body.questions[0].text).toBe(
        'Is JavaScript dynamically typed?',
      );
      expect(response.body.questions[0].type).toBe('BOOLEAN');
    });

    it('should create a quiz with input question', async () => {
      const createQuizDto = {
        title: 'Programming Quiz',
        questions: [
          {
            text: 'What keyword declares a constant in JavaScript?',
            type: 'INPUT',
            options: [],
            correctAnswers: ['const'],
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/quizzes')
        .send(createQuizDto)
        .expect(201);

      expect(response.body.title).toBe('Programming Quiz');
      expect(response.body.questions[0].type).toBe('INPUT');
      expect(response.body.questions[0].correctAnswers).toContain('const');
    });

    it('should create a quiz with checkbox question', async () => {
      const createQuizDto = {
        title: 'Data Types Quiz',
        questions: [
          {
            text: 'Which are JavaScript data types?',
            type: 'CHECKBOX',
            options: ['String', 'Integer', 'Boolean', 'Float'],
            correctAnswers: ['String', 'Boolean'],
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/quizzes')
        .send(createQuizDto)
        .expect(201);

      expect(response.body.questions[0].type).toBe('CHECKBOX');
      expect(response.body.questions[0].options).toHaveLength(4);
      expect(response.body.questions[0].correctAnswers).toHaveLength(2);
    });

    it('should create a quiz with multiple questions', async () => {
      const createQuizDto = {
        title: 'Mixed Quiz',
        questions: [
          {
            text: 'Question 1?',
            type: 'BOOLEAN',
            options: ['True', 'False'],
            correctAnswers: ['True'],
          },
          {
            text: 'Question 2?',
            type: 'INPUT',
            options: [],
            correctAnswers: ['answer'],
          },
          {
            text: 'Question 3?',
            type: 'CHECKBOX',
            options: ['A', 'B', 'C'],
            correctAnswers: ['A', 'C'],
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/quizzes')
        .send(createQuizDto)
        .expect(201);

      expect(response.body.questions).toHaveLength(3);
      expect(response.body.questions[0].order).toBe(0);
      expect(response.body.questions[1].order).toBe(1);
      expect(response.body.questions[2].order).toBe(2);
    });

    it('should return 400 for empty title', async () => {
      const createQuizDto = {
        title: '',
        questions: [
          {
            text: 'Question?',
            type: 'BOOLEAN',
            options: ['True', 'False'],
            correctAnswers: ['True'],
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/quizzes')
        .send(createQuizDto)
        .expect(400);
    });

    it('should return 400 for empty questions array', async () => {
      const createQuizDto = {
        title: 'Quiz Title',
        questions: [],
      };

      await request(app.getHttpServer())
        .post('/api/quizzes')
        .send(createQuizDto)
        .expect(400);
    });

    it('should return 400 for invalid question type', async () => {
      const createQuizDto = {
        title: 'Quiz Title',
        questions: [
          {
            text: 'Question?',
            type: 'INVALID_TYPE',
            options: [],
            correctAnswers: [],
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/quizzes')
        .send(createQuizDto)
        .expect(400);
    });
  });

  describe('GET /api/quizzes', () => {
    it('should return empty array when no quizzes exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/quizzes')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all quizzes with question count', async () => {
      // Create test quizzes
      await request(app.getHttpServer())
        .post('/api/quizzes')
        .send({
          title: 'Quiz 1',
          questions: [
            { text: 'Q1', type: 'BOOLEAN', options: ['True', 'False'] },
            { text: 'Q2', type: 'BOOLEAN', options: ['True', 'False'] },
          ],
        });

      await request(app.getHttpServer())
        .post('/api/quizzes')
        .send({
          title: 'Quiz 2',
          questions: [{ text: 'Q1', type: 'INPUT', options: [] }],
        });

      const response = await request(app.getHttpServer())
        .get('/api/quizzes')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('questionCount');
      expect(
        response.body.find(
          (q: { title: string; questionCount: number }) => q.title === 'Quiz 1',
        ).questionCount,
      ).toBe(2);
      expect(
        response.body.find(
          (q: { title: string; questionCount: number }) => q.title === 'Quiz 2',
        ).questionCount,
      ).toBe(1);
    });

    it('should return quizzes sorted by creation date (newest first)', async () => {
      await request(app.getHttpServer())
        .post('/api/quizzes')
        .send({
          title: 'First Quiz',
          questions: [
            { text: 'Q', type: 'BOOLEAN', options: ['True', 'False'] },
          ],
        });

      await request(app.getHttpServer())
        .post('/api/quizzes')
        .send({
          title: 'Second Quiz',
          questions: [
            { text: 'Q', type: 'BOOLEAN', options: ['True', 'False'] },
          ],
        });

      const response = await request(app.getHttpServer())
        .get('/api/quizzes')
        .expect(200);

      expect(response.body[0].title).toBe('Second Quiz');
      expect(response.body[1].title).toBe('First Quiz');
    });
  });

  describe('GET /api/quizzes/:id', () => {
    it('should return quiz with all questions', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/quizzes')
        .send({
          title: 'Test Quiz',
          questions: [
            {
              text: 'Q1',
              type: 'BOOLEAN',
              options: ['True', 'False'],
              correctAnswers: ['True'],
            },
            {
              text: 'Q2',
              type: 'INPUT',
              options: [],
              correctAnswers: ['answer'],
            },
          ],
        });

      const quizId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/api/quizzes/${quizId}`)
        .expect(200);

      expect(response.body.id).toBe(quizId);
      expect(response.body.title).toBe('Test Quiz');
      expect(response.body.questions).toHaveLength(2);
      expect(response.body.questions[0].text).toBe('Q1');
      expect(response.body.questions[1].text).toBe('Q2');
    });

    it('should return 404 for non-existent quiz', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .get(`/api/quizzes/${nonExistentId}`)
        .expect(404);
    });

    it('should return questions sorted by order', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/quizzes')
        .send({
          title: 'Ordered Quiz',
          questions: [
            { text: 'First', type: 'BOOLEAN', options: ['True', 'False'] },
            { text: 'Second', type: 'BOOLEAN', options: ['True', 'False'] },
            { text: 'Third', type: 'BOOLEAN', options: ['True', 'False'] },
          ],
        });

      const response = await request(app.getHttpServer())
        .get(`/api/quizzes/${createResponse.body.id}`)
        .expect(200);

      expect(response.body.questions[0].text).toBe('First');
      expect(response.body.questions[0].order).toBe(0);
      expect(response.body.questions[1].text).toBe('Second');
      expect(response.body.questions[1].order).toBe(1);
      expect(response.body.questions[2].text).toBe('Third');
      expect(response.body.questions[2].order).toBe(2);
    });
  });

  describe('DELETE /api/quizzes/:id', () => {
    it('should delete an existing quiz', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/quizzes')
        .send({
          title: 'Quiz to Delete',
          questions: [
            { text: 'Q', type: 'BOOLEAN', options: ['True', 'False'] },
          ],
        });

      const quizId = createResponse.body.id;

      await request(app.getHttpServer())
        .delete(`/api/quizzes/${quizId}`)
        .expect(200);

      // Verify quiz is deleted
      await request(app.getHttpServer())
        .get(`/api/quizzes/${quizId}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent quiz', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .delete(`/api/quizzes/${nonExistentId}`)
        .expect(404);
    });

    it('should delete quiz and all its questions', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/quizzes')
        .send({
          title: 'Quiz with Questions',
          questions: [
            { text: 'Q1', type: 'BOOLEAN', options: ['True', 'False'] },
            { text: 'Q2', type: 'INPUT', options: [] },
            { text: 'Q3', type: 'CHECKBOX', options: ['A', 'B'] },
          ],
        });

      const quizId = createResponse.body.id;

      // Count questions before delete
      const questionsBefore = await prisma.question.count({
        where: { quizId },
      });
      expect(questionsBefore).toBe(3);

      await request(app.getHttpServer())
        .delete(`/api/quizzes/${quizId}`)
        .expect(200);

      // Verify questions are deleted (cascade)
      const questionsAfter = await prisma.question.count({ where: { quizId } });
      expect(questionsAfter).toBe(0);
    });
  });

  describe('Validation', () => {
    it('should validate question text is not empty', async () => {
      const createQuizDto = {
        title: 'Quiz',
        questions: [
          {
            text: '',
            type: 'BOOLEAN',
            options: ['True', 'False'],
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/quizzes')
        .send(createQuizDto)
        .expect(400);
    });

    it('should accept quiz without correctAnswers', async () => {
      const createQuizDto = {
        title: 'Quiz without answers',
        questions: [
          {
            text: 'What is your favorite color?',
            type: 'INPUT',
            options: [],
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/quizzes')
        .send(createQuizDto)
        .expect(201);

      expect(response.body.questions[0].correctAnswers).toEqual([]);
    });
  });
});
