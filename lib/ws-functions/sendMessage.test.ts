import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { sendMessage } from './sendMessage';

// Mock the prisma module
jest.mock('../prisma');

// Import the mocked prisma instance after mocking
import { prisma } from '../prisma';

// Type the mocked prisma properly
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Type helper for the mocked functions
const mockFindUnique = mockPrisma.user.findUnique as jest.MockedFunction<typeof mockPrisma.user.findUnique>;
const mockCreate = mockPrisma.message.create as jest.MockedFunction<typeof mockPrisma.message.create>;

describe('sendMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should create and return a message with user data', async () => {
      const mockRecipient = { id: 2 } as { id: number };
      const mockMessage = {
        id: 1,
        content: 'Hello, Alice!',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        read: false,
        sentById: 1,
        sentToId: 2,
        sentBy: { id: 1, username: 'bob' },
        sentTo: { id: 2, username: 'alice' },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockFindUnique.mockResolvedValue(mockRecipient as any);
      mockCreate.mockResolvedValue(mockMessage);

      const result = await sendMessage({
        content: 'Hello, Alice!',
        sentById: 1,
        sentToId: 2,
      });

      expect(result).toEqual(mockMessage);
      expect(result.sentBy).toEqual({ id: 1, username: 'bob' });
      expect(result.sentTo).toEqual({ id: 2, username: 'alice' });
    });
  });

  describe('Self-messaging validation', () => {
    it('should throw error when sentById equals sentToId', async () => {
      await expect(
        sendMessage({
          content: 'Test message',
          sentById: 1,
          sentToId: 1,
        })
      ).rejects.toThrow('Users cannot send messages to themselves');

      // Should not call any prisma methods
      expect(mockFindUnique).not.toHaveBeenCalled();
      expect(mockPrisma.message.create).not.toHaveBeenCalled();
    });
  });

  describe('Recipient validation', () => {
    it('should throw error when recipient does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(
        sendMessage({
          content: 'Message to non-existent user',
          sentById: 1,
          sentToId: 999,
        })
      ).rejects.toThrow('Recipient user does not exist');

      // Should have checked for recipient but not created message
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        select: { id: true },
      });
      expect(mockPrisma.message.create).not.toHaveBeenCalled();
    });
  });

  describe('Return value structure', () => {
    it('should return message with all expected fields', async () => {
      const mockRecipient = { id: 2 } as { id: number };
      const mockMessage = {
        id: 1,
        content: 'Test message',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        read: false,
        sentById: 1,
        sentToId: 2,
        sentBy: { id: 1, username: 'bob' },
        sentTo: { id: 2, username: 'alice' },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockFindUnique.mockResolvedValue(mockRecipient as any);
      mockCreate.mockResolvedValue(mockMessage);

      const result = await sendMessage({
        content: 'Test message',
        sentById: 1,
        sentToId: 2,
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('read');
      expect(result).toHaveProperty('sentById');
      expect(result).toHaveProperty('sentToId');
      expect(result).toHaveProperty('sentBy');
      expect(result).toHaveProperty('sentTo');
    });

    it('should include sentBy user with id and username', async () => {
      const mockRecipient = { id: 2 } as { id: number };
      const mockMessage = {
        id: 1,
        content: 'Test message',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        read: false,
        sentById: 1,
        sentToId: 2,
        sentBy: { id: 1, username: 'bob' },
        sentTo: { id: 2, username: 'alice' },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockFindUnique.mockResolvedValue(mockRecipient as any);
      mockCreate.mockResolvedValue(mockMessage);

      const result = await sendMessage({
        content: 'Test message',
        sentById: 1,
        sentToId: 2,
      });

      expect(result.sentBy).toEqual({ id: 1, username: 'bob' });
      expect(result.sentBy).toHaveProperty('id');
      expect(result.sentBy).toHaveProperty('username');
    });

    it('should include sentTo user with id and username', async () => {
      const mockRecipient = { id: 2 } as { id: number };
      const mockMessage = {
        id: 1,
        content: 'Test message',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        read: false,
        sentById: 1,
        sentToId: 2,
        sentBy: { id: 1, username: 'bob' },
        sentTo: { id: 2, username: 'alice' },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockFindUnique.mockResolvedValue(mockRecipient as any);
      mockCreate.mockResolvedValue(mockMessage);

      const result = await sendMessage({
        content: 'Test message',
        sentById: 1,
        sentToId: 2,
      });

      expect(result.sentTo).toEqual({ id: 2, username: 'alice' });
      expect(result.sentTo).toHaveProperty('id');
      expect(result.sentTo).toHaveProperty('username');
    });
  });
});
