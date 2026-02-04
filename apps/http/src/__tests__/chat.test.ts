import request from 'supertest';
import express from 'express';
import { chatRouter } from '../routes/v1/chat';
import { prisma } from '@repo/db/client';

// Mock dependencies
jest.mock('@repo/db/client', () => ({
    prisma: {
        recording: {
            findUnique: jest.fn(),
        },
        chatSession: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
        },
        chatMessage: {
            create: jest.fn(),
        },
    },
}));
jest.mock('@langchain/google-genai', () => ({
    ChatGoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        invoke: jest.fn().mockResolvedValue({
            content: 'This is an AI response',
        }),
    })),
}));

const app = express();
app.use(express.json());

// Mock auth middleware
app.use((req: any, _res, next) => {
    req.userId = 'test-user-123';
    next();
});

app.use('/chat', chatRouter);

// Valid UUIDs for testing
const VALID_RECORDING_ID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_CHAT_ID = '550e8400-e29b-41d4-a716-446655440001';

describe('Chat Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /chat/start', () => {
        it('should create new chat session for owned recording', async () => {
            const mockChatSession = {
                id: VALID_CHAT_ID,
                recordingId: VALID_RECORDING_ID,
                title: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.recording.findUnique as jest.Mock).mockResolvedValue({
                userId: 'test-user-123',
            });
            (prisma.chatSession.create as jest.Mock).mockResolvedValue(mockChatSession);

            const response = await request(app)
                .post('/chat/start')
                .send({
                    recordingId: VALID_RECORDING_ID,
                });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                chatId: VALID_CHAT_ID,
                messages: [],
            });
        });

        it('should deny creating chat for non-owned recording', async () => {
            (prisma.recording.findUnique as jest.Mock).mockResolvedValue({
                userId: 'different-user',
            });

            const response = await request(app)
                .post('/chat/start')
                .send({
                    recordingId: VALID_RECORDING_ID,
                });

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Access denied');
        });

        it('should reject invalid recordingId format', async () => {
            const response = await request(app)
                .post('/chat/start')
                .send({
                    recordingId: 'invalid-uuid',
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid input');
        });

        it('should reject missing recordingId', async () => {
            const response = await request(app)
                .post('/chat/start')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid input');
        });
    });

    describe('POST /chat/message', () => {
        it('should send message and get AI response', async () => {
            const mockChatSession = {
                id: VALID_CHAT_ID,
                recordingId: VALID_RECORDING_ID,
                messages: [],
                recording: {
                    userId: 'test-user-123',
                    transcript: {
                        transcript: 'Meeting transcript content',
                    },
                },
            };

            const mockUserMessage = {
                id: '550e8400-e29b-41d4-a716-446655440002',
                chatSessionId: VALID_CHAT_ID,
                role: 'USER',
                content: 'What was discussed?',
            };

            const mockAssistantMessage = {
                id: '550e8400-e29b-41d4-a716-446655440003',
                chatSessionId: VALID_CHAT_ID,
                role: 'ASSISTANT',
                content: 'This is an AI response',
            };

            (prisma.chatSession.findUnique as jest.Mock)
                .mockResolvedValueOnce(mockChatSession) // ownership check
                .mockResolvedValueOnce(mockChatSession); // message fetch

            (prisma.chatMessage.create as jest.Mock)
                .mockResolvedValueOnce(mockUserMessage)
                .mockResolvedValueOnce(mockAssistantMessage);

            (prisma.chatSession.update as jest.Mock).mockResolvedValue({});

            const response = await request(app)
                .post('/chat/message')
                .send({
                    chatId: VALID_CHAT_ID,
                    message: 'What was discussed?',
                });

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                response: 'This is an AI response',
                userMessageId: '550e8400-e29b-41d4-a716-446655440002',
                assistantMessageId: '550e8400-e29b-41d4-a716-446655440003',
            });
        });

        it('should deny sending message to non-owned chat', async () => {
            (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue({
                recording: { userId: 'different-user' },
            });

            const response = await request(app)
                .post('/chat/message')
                .send({
                    chatId: VALID_CHAT_ID,
                    message: 'What was discussed?',
                });

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Access denied');
        });

        it('should return 403 for non-existent chat', async () => {
            (prisma.chatSession.findUnique as jest.Mock)
                .mockResolvedValueOnce(null);

            const response = await request(app)
                .post('/chat/message')
                .send({
                    chatId: VALID_CHAT_ID,
                    message: 'What was discussed?',
                });

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Access denied');
        });

        it('should return 404 when transcript not found', async () => {
            const mockChatSession = {
                id: VALID_CHAT_ID,
                recording: {
                    userId: 'test-user-123',
                    transcript: null,
                },
                messages: [],
            };

            (prisma.chatSession.findUnique as jest.Mock)
                .mockResolvedValueOnce(mockChatSession)
                .mockResolvedValueOnce(mockChatSession);

            const response = await request(app)
                .post('/chat/message')
                .send({
                    chatId: VALID_CHAT_ID,
                    message: 'What was discussed?',
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Transcript not found for this recording');
        });

        it('should reject empty message', async () => {
            const response = await request(app)
                .post('/chat/message')
                .send({
                    chatId: VALID_CHAT_ID,
                    message: '',
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid input');
        });

        it('should reject invalid chatId format', async () => {
            const response = await request(app)
                .post('/chat/message')
                .send({
                    chatId: 'invalid-uuid',
                    message: 'What was discussed?',
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid input');
        });
    });

    describe('GET /chat/', () => {
        it('should list user chats', async () => {
            const mockChats = [
                {
                    id: VALID_CHAT_ID,
                    recordingId: VALID_RECORDING_ID,
                    title: 'Chat about meeting',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    messages: [{ content: 'Last message' }],
                    recording: { link: 'https://meet.google.com/abc' },
                },
            ];

            (prisma.chatSession.findMany as jest.Mock).mockResolvedValue(mockChats);

            const response = await request(app).get('/chat/');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0]).toMatchObject({
                id: VALID_CHAT_ID,
                title: 'Chat about meeting',
                lastMessage: 'Last message',
            });
        });

        it('should filter chats by recordingId', async () => {
            (prisma.chatSession.findMany as jest.Mock).mockResolvedValue([]);

            const response = await request(app)
                .get('/chat/')
                .query({ recordingId: VALID_RECORDING_ID });

            expect(response.status).toBe(200);
            expect(prisma.chatSession.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        recordingId: VALID_RECORDING_ID,
                    }),
                })
            );
        });

        it('should return empty array when no chats', async () => {
            (prisma.chatSession.findMany as jest.Mock).mockResolvedValue([]);

            const response = await request(app).get('/chat/');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });
    });

    describe('GET /chat/:chatId', () => {
        it('should return chat with messages for owner', async () => {
            const mockChat = {
                id: VALID_CHAT_ID,
                recordingId: VALID_RECORDING_ID,
                title: 'Chat about meeting',
                createdAt: new Date(),
                updatedAt: new Date(),
                messages: [
                    {
                        id: '550e8400-e29b-41d4-a716-446655440004',
                        role: 'USER',
                        content: 'Question',
                        createdAt: new Date(),
                    },
                    {
                        id: '550e8400-e29b-41d4-a716-446655440005',
                        role: 'ASSISTANT',
                        content: 'Answer',
                        createdAt: new Date(),
                    },
                ],
                recording: {
                    id: VALID_RECORDING_ID,
                    link: 'https://meet.google.com/abc',
                    userId: 'test-user-123',
                },
            };

            (prisma.chatSession.findUnique as jest.Mock)
                .mockResolvedValueOnce({ recording: { userId: 'test-user-123' } })
                .mockResolvedValueOnce(mockChat);

            const response = await request(app).get(`/chat/${VALID_CHAT_ID}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(VALID_CHAT_ID);
            expect(response.body.title).toBe('Chat about meeting');
            expect(response.body.messages).toHaveLength(2);
            expect(response.body.messages[0].role).toBe('user');
        });

        it('should deny access to non-owned chat', async () => {
            (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue({
                recording: { userId: 'different-user' },
            });

            const response = await request(app).get(`/chat/${VALID_CHAT_ID}`);

            expect(response.status).toBe(403);
            expect(response.body.error).toBe('Access denied');
        });

        it('should return 404 for non-existent chat', async () => {
            (prisma.chatSession.findUnique as jest.Mock)
                .mockResolvedValueOnce({ recording: { userId: 'test-user-123' } })
                .mockResolvedValueOnce(null);

            const response = await request(app).get(`/chat/${VALID_CHAT_ID}`);

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Chat not found');
        });
    });
});
