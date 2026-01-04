import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { getThreadMessages } from './getThreadMessages';

// Mock the prisma module
jest.mock('../prisma');

// Import the mocked prisma instance after mocking
import { prisma } from '../prisma';

// Type the mocked prisma properly
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Type helper for the mocked findMany function
const mockFindMany = mockPrisma.message.findMany as jest.MockedFunction<typeof mockPrisma.message.findMany>;

describe('getThreadMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should return messages between two users', async () => {
      const userId = 1;
      const otherUserId = 2;
      const mockMessages = [
        {
          id: 1,
          content: 'Hello!',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          read: false,
          sentById: userId,
          sentToId: otherUserId,
          sentBy: { id: userId, username: 'bob' },
          sentTo: { id: otherUserId, username: 'alice' },
        },
        {
          id: 2,
          content: 'Hi there!',
          createdAt: new Date('2024-01-01T10:05:00Z'),
          read: false,
          sentById: otherUserId,
          sentToId: userId,
          sentBy: { id: otherUserId, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
      ];

      mockFindMany.mockResolvedValue(mockMessages);

      const result = await getThreadMessages({ userId, otherUserId });

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockMessages);
    });

    it('should return empty array when no messages exist', async () => {
      const userId = 1;
      const otherUserId = 2;

      mockFindMany.mockResolvedValue([]);

      const result = await getThreadMessages({ userId, otherUserId });

      expect(result).toEqual([]);
    });
  });

  describe('Bidirectional message handling', () => {
    it('should return messages sent from userId to otherUserId', async () => {
      const userId = 1;
      const otherUserId = 2;
      const mockMessages = [
        {
          id: 1,
          content: 'Message from user to other',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          read: true,
          sentById: userId,
          sentToId: otherUserId,
          sentBy: { id: userId, username: 'bob' },
          sentTo: { id: otherUserId, username: 'alice' },
        },
      ];

      mockFindMany.mockResolvedValue(mockMessages);

      const result = await getThreadMessages({ userId, otherUserId });

      expect(result).toHaveLength(1);
      expect(result[0].sentById).toBe(userId);
      expect(result[0].sentToId).toBe(otherUserId);
    });

    it('should return messages sent from otherUserId to userId', async () => {
      const userId = 1;
      const otherUserId = 2;
      const mockMessages = [
        {
          id: 1,
          content: 'Message from other to user',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          read: false,
          sentById: otherUserId,
          sentToId: userId,
          sentBy: { id: otherUserId, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
      ];

      mockFindMany.mockResolvedValue(mockMessages);

      const result = await getThreadMessages({ userId, otherUserId });

      expect(result).toHaveLength(1);
      expect(result[0].sentById).toBe(otherUserId);
      expect(result[0].sentToId).toBe(userId);
    });

    it('should return both directions in a single result', async () => {
      const userId = 1;
      const otherUserId = 2;
      const mockMessages = [
        {
          id: 1,
          content: 'Message from user',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          read: true,
          sentById: userId,
          sentToId: otherUserId,
          sentBy: { id: userId, username: 'bob' },
          sentTo: { id: otherUserId, username: 'alice' },
        },
        {
          id: 2,
          content: 'Message from other',
          createdAt: new Date('2024-01-01T10:05:00Z'),
          read: false,
          sentById: otherUserId,
          sentToId: userId,
          sentBy: { id: otherUserId, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
        {
          id: 3,
          content: 'Another from user',
          createdAt: new Date('2024-01-01T10:10:00Z'),
          read: true,
          sentById: userId,
          sentToId: otherUserId,
          sentBy: { id: userId, username: 'bob' },
          sentTo: { id: otherUserId, username: 'alice' },
        },
      ];

      mockFindMany.mockResolvedValue(mockMessages);

      const result = await getThreadMessages({ userId, otherUserId });

      expect(result).toHaveLength(3);
      expect(result[0].sentById).toBe(userId);
      expect(result[1].sentById).toBe(otherUserId);
      expect(result[2].sentById).toBe(userId);
    });
  });

  describe('Message ordering', () => {
    it('should order messages by createdAt ascending (oldest first)', async () => {
      const userId = 1;
      const otherUserId = 2;
      const mockMessages = [
        {
          id: 1,
          content: 'Oldest message',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          read: true,
          sentById: userId,
          sentToId: otherUserId,
          sentBy: { id: userId, username: 'bob' },
          sentTo: { id: otherUserId, username: 'alice' },
        },
        {
          id: 2,
          content: 'Middle message',
          createdAt: new Date('2024-01-01T11:00:00Z'),
          read: false,
          sentById: otherUserId,
          sentToId: userId,
          sentBy: { id: otherUserId, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
        {
          id: 3,
          content: 'Newest message',
          createdAt: new Date('2024-01-01T12:00:00Z'),
          read: true,
          sentById: userId,
          sentToId: otherUserId,
          sentBy: { id: userId, username: 'bob' },
          sentTo: { id: otherUserId, username: 'alice' },
        },
      ];

      mockFindMany.mockResolvedValue(mockMessages);

      const result = await getThreadMessages({ userId, otherUserId });

      expect(result).toHaveLength(3);
      expect(result[0].content).toBe('Oldest message');
      expect(result[1].content).toBe('Middle message');
      expect(result[2].content).toBe('Newest message');
    });

    it('should maintain chronological order with multiple messages', async () => {
      const userId = 1;
      const otherUserId = 2;
      const mockMessages = [
        {
          id: 1,
          content: 'First',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          read: true,
          sentById: userId,
          sentToId: otherUserId,
          sentBy: { id: userId, username: 'bob' },
          sentTo: { id: otherUserId, username: 'alice' },
        },
        {
          id: 2,
          content: 'Second',
          createdAt: new Date('2024-01-01T10:01:00Z'),
          read: false,
          sentById: otherUserId,
          sentToId: userId,
          sentBy: { id: otherUserId, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
        {
          id: 3,
          content: 'Third',
          createdAt: new Date('2024-01-01T10:02:00Z'),
          read: true,
          sentById: userId,
          sentToId: otherUserId,
          sentBy: { id: userId, username: 'bob' },
          sentTo: { id: otherUserId, username: 'alice' },
        },
        {
          id: 4,
          content: 'Fourth',
          createdAt: new Date('2024-01-01T10:03:00Z'),
          read: false,
          sentById: otherUserId,
          sentToId: userId,
          sentBy: { id: otherUserId, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
        {
          id: 5,
          content: 'Fifth',
          createdAt: new Date('2024-01-01T10:04:00Z'),
          read: true,
          sentById: userId,
          sentToId: otherUserId,
          sentBy: { id: userId, username: 'bob' },
          sentTo: { id: otherUserId, username: 'alice' },
        },
      ];

      mockFindMany.mockResolvedValue(mockMessages);

      const result = await getThreadMessages({ userId, otherUserId });

      expect(result).toHaveLength(5);
      expect(result[0].content).toBe('First');
      expect(result[1].content).toBe('Second');
      expect(result[2].content).toBe('Third');
      expect(result[3].content).toBe('Fourth');
      expect(result[4].content).toBe('Fifth');
      
      // Verify timestamps are in ascending order
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].createdAt.getTime()).toBeLessThan(result[i + 1].createdAt.getTime());
      }
    });
  });

  describe('Query structure verification', () => {
    it('should call prisma.message.findMany with correct OR conditions', async () => {
      const userId = 1;
      const otherUserId = 2;

      mockFindMany.mockResolvedValue([]);

      await getThreadMessages({ userId, otherUserId });

      expect(mockPrisma.message.findMany).toHaveBeenCalledTimes(1);
      const callArgs = mockFindMany.mock.calls[0][0];
      
      expect(callArgs?.where).toEqual({
        OR: [
          {
            sentById: userId,
            sentToId: otherUserId,
          },
          {
            sentById: otherUserId,
            sentToId: userId,
          },
        ],
      });
    });

    it('should include proper sentBy and sentTo selects', async () => {
      const userId = 1;
      const otherUserId = 2;

      mockFindMany.mockResolvedValue([]);

      await getThreadMessages({ userId, otherUserId });

      const callArgs = mockFindMany.mock.calls[0][0];
      
      expect(callArgs?.include).toEqual({
        sentBy: {
          select: {
            id: true,
            username: true,
          },
        },
        sentTo: {
          select: {
            id: true,
            username: true,
          },
        },
      });
    });

    it('should use correct orderBy', async () => {
      const userId = 1;
      const otherUserId = 2;

      mockFindMany.mockResolvedValue([]);

      await getThreadMessages({ userId, otherUserId });

      const callArgs = mockFindMany.mock.calls[0][0];
      
      expect(callArgs?.orderBy).toEqual({
        createdAt: 'asc',
      });
    });
  });
});
