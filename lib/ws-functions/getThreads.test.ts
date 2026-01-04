import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { getThreads } from './getThreads';

// Mock the prisma module
jest.mock('../prisma');

// Import the mocked prisma instance after mocking
import { prisma } from '../prisma';

// Type the mocked prisma properly
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Type helper for the mocked findMany function
const mockFindMany = mockPrisma.message.findMany as jest.MockedFunction<typeof mockPrisma.message.findMany>;

describe('getThreads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should return threads for a user with messages', async () => {
      const userId = 1;
      const mockMessages = [
        {
          id: 1,
          content: 'Hello!',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          read: false,
          sentById: 2,
          sentToId: userId,
          sentBy: { id: 2, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
      ];

      mockFindMany.mockResolvedValue(mockMessages);

      const result = await getThreads(userId);

      expect(result).toHaveLength(1);
      expect(result[0].otherUser).toEqual({ id: 2, username: 'alice' });
      expect(result[0].lastMessage).toEqual(mockMessages[0]);
      expect(result[0].unreadCount).toBe(1);
    });

    it('should return empty array when user has no messages', async () => {
      const userId = 1;

      mockFindMany.mockResolvedValue([]);

      const result = await getThreads(userId);

      expect(result).toEqual([]);
      expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ sentById: userId }, { sentToId: userId }],
        },
        include: {
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('Grouping messages by conversation partner', () => {
    it('should group messages by conversation partner correctly', async () => {
      const userId = 1;
      const mockMessages = [
        {
          id: 1,
          content: 'Hello from Alice',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          read: true,
          sentById: 2,
          sentToId: userId,
          sentBy: { id: 2, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
        {
          id: 2,
          content: 'Hello from Charlie',
          createdAt: new Date('2024-01-01T11:00:00Z'),
          read: false,
          sentById: 3,
          sentToId: userId,
          sentBy: { id: 3, username: 'charlie' },
          sentTo: { id: userId, username: 'bob' },
        },
      ];

      mockFindMany.mockResolvedValue(mockMessages);

      const result = await getThreads(userId);

      expect(result).toHaveLength(2);
      expect(result[0].otherUser.username).toBe('charlie');
      expect(result[1].otherUser.username).toBe('alice');
    });

    it('should handle multiple messages in the same thread', async () => {
      const userId = 1;
      const mockMessages = [
        {
          id: 3,
          content: 'Most recent message',
          createdAt: new Date('2024-01-01T12:00:00Z'),
          read: false,
          sentById: 2,
          sentToId: userId,
          sentBy: { id: 2, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
        {
          id: 2,
          content: 'Middle message',
          createdAt: new Date('2024-01-01T11:00:00Z'),
          read: false,
          sentById: 2,
          sentToId: userId,
          sentBy: { id: 2, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
        {
          id: 1,
          content: 'Oldest message',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          read: true,
          sentById: userId,
          sentToId: 2,
          sentBy: { id: userId, username: 'bob' },
          sentTo: { id: 2, username: 'alice' },
        },
      ];

      mockFindMany.mockResolvedValue(mockMessages);

      const result = await getThreads(userId);

      expect(result).toHaveLength(1);
      expect(result[0].otherUser).toEqual({ id: 2, username: 'alice' });
      expect(result[0].lastMessage).toEqual(mockMessages[0]);
      expect(result[0].unreadCount).toBe(2);
    });
  });

  describe('Unread message counting', () => {
    it('should count unread messages correctly (only messages sent TO the user)', async () => {
      const userId = 1;
      const mockMessages = [
        {
          id: 1,
          content: 'Unread message to user',
          createdAt: new Date('2024-01-01T12:00:00Z'),
          read: false,
          sentById: 2,
          sentToId: userId,
          sentBy: { id: 2, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
        {
          id: 2,
          content: 'Read message to user',
          createdAt: new Date('2024-01-01T11:00:00Z'),
          read: true,
          sentById: 2,
          sentToId: userId,
          sentBy: { id: 2, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
        {
          id: 3,
          content: 'Unread message FROM user (should not count)',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          read: false,
          sentById: userId,
          sentToId: 2,
          sentBy: { id: userId, username: 'bob' },
          sentTo: { id: 2, username: 'alice' },
        },
      ];

      mockFindMany.mockResolvedValue(mockMessages);

      const result = await getThreads(userId);

      expect(result).toHaveLength(1);
      expect(result[0].unreadCount).toBe(1); // Only one unread message sent TO the user
    });

    it('should have zero unread count when all messages are read', async () => {
      const userId = 1;
      const mockMessages = [
        {
          id: 1,
          content: 'Read message 1',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          read: true,
          sentById: 2,
          sentToId: userId,
          sentBy: { id: 2, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
        {
          id: 2,
          content: 'Read message 2',
          createdAt: new Date('2024-01-01T11:00:00Z'),
          read: true,
          sentById: 2,
          sentToId: userId,
          sentBy: { id: 2, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
      ];

      mockFindMany.mockResolvedValue(mockMessages);

      const result = await getThreads(userId);

      expect(result).toHaveLength(1);
      expect(result[0].unreadCount).toBe(0);
    });
  });

  describe('Thread sorting', () => {
    it('should sort threads by most recent message', async () => {
      const userId = 1;
      const mockMessages = [
        {
          id: 1,
          content: 'Most recent',
          createdAt: new Date('2024-01-01T12:00:00Z'),
          read: false,
          sentById: 3,
          sentToId: userId,
          sentBy: { id: 3, username: 'charlie' },
          sentTo: { id: userId, username: 'bob' },
        },
        {
          id: 2,
          content: 'Middle',
          createdAt: new Date('2024-01-01T11:00:00Z'),
          read: false,
          sentById: 2,
          sentToId: userId,
          sentBy: { id: 2, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
        {
          id: 3,
          content: 'Oldest',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          read: false,
          sentById: 4,
          sentToId: userId,
          sentBy: { id: 4, username: 'david' },
          sentTo: { id: userId, username: 'bob' },
        },
      ];

      mockFindMany.mockResolvedValue(mockMessages);

      const result = await getThreads(userId);

      expect(result).toHaveLength(3);
      expect(result[0].otherUser.username).toBe('charlie');
      expect(result[1].otherUser.username).toBe('alice');
      expect(result[2].otherUser.username).toBe('david');
    });

    it('should not include lastMessageTime in the returned thread objects', async () => {
      const userId = 1;
      const mockMessages = [
        {
          id: 1,
          content: 'Test message',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          read: false,
          sentById: 2,
          sentToId: userId,
          sentBy: { id: 2, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
      ];

      mockFindMany.mockResolvedValue(mockMessages);

      const result = await getThreads(userId);

      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('lastMessageTime');
      expect(result[0]).toHaveProperty('otherUser');
      expect(result[0]).toHaveProperty('lastMessage');
      expect(result[0]).toHaveProperty('unreadCount');
    });
  });

  describe('Distinguishing sent and received messages', () => {
    it('should correctly identify the other user when user sends messages', async () => {
      const userId = 1;
      const mockMessages = [
        {
          id: 1,
          content: 'Message sent by user',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          read: true,
          sentById: userId,
          sentToId: 2,
          sentBy: { id: userId, username: 'bob' },
          sentTo: { id: 2, username: 'alice' },
        },
      ];

      mockFindMany.mockResolvedValue(mockMessages);

      const result = await getThreads(userId);

      expect(result).toHaveLength(1);
      expect(result[0].otherUser).toEqual({ id: 2, username: 'alice' });
      expect(result[0].unreadCount).toBe(0); // Sent messages don't count as unread
    });

    it('should correctly identify the other user when user receives messages', async () => {
      const userId = 1;
      const mockMessages = [
        {
          id: 1,
          content: 'Message received by user',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          read: false,
          sentById: 2,
          sentToId: userId,
          sentBy: { id: 2, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
      ];

      mockFindMany.mockResolvedValue(mockMessages);

      const result = await getThreads(userId);

      expect(result).toHaveLength(1);
      expect(result[0].otherUser).toEqual({ id: 2, username: 'alice' });
      expect(result[0].unreadCount).toBe(1);
    });

    it('should handle a thread with both sent and received messages', async () => {
      const userId = 1;
      const mockMessages = [
        {
          id: 1,
          content: 'Received message (unread)',
          createdAt: new Date('2024-01-01T12:00:00Z'),
          read: false,
          sentById: 2,
          sentToId: userId,
          sentBy: { id: 2, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
        {
          id: 2,
          content: 'Sent message',
          createdAt: new Date('2024-01-01T11:00:00Z'),
          read: true,
          sentById: userId,
          sentToId: 2,
          sentBy: { id: userId, username: 'bob' },
          sentTo: { id: 2, username: 'alice' },
        },
        {
          id: 3,
          content: 'Received message (read)',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          read: true,
          sentById: 2,
          sentToId: userId,
          sentBy: { id: 2, username: 'alice' },
          sentTo: { id: userId, username: 'bob' },
        },
      ];

      mockFindMany.mockResolvedValue(mockMessages);

      const result = await getThreads(userId);

      expect(result).toHaveLength(1);
      expect(result[0].otherUser).toEqual({ id: 2, username: 'alice' });
      expect(result[0].lastMessage.id).toBe(1); // Most recent message
      expect(result[0].unreadCount).toBe(1); // Only one unread received message
    });
  });
});
