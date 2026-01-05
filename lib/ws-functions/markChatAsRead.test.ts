import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { markChatAsRead } from './markChatAsRead';

// Mock the prisma module
jest.mock('../prisma');

// Import the mocked prisma instance after mocking
import { prisma } from '../prisma';

// Type the mocked prisma properly
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Type helper for the mocked updateMany function
const mockUpdateMany = mockPrisma.message.updateMany as jest.MockedFunction<typeof mockPrisma.message.updateMany>;

describe('markChatAsRead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should mark unread messages as read', async () => {
      const receivingUserId = 1;
      const sendingUserId = 2;
      
      mockUpdateMany.mockResolvedValue({ count: 3 });

      await markChatAsRead({ receivingUserId, sendingUserId });

      expect(mockPrisma.message.updateMany).toHaveBeenCalledTimes(1);
    });

    it('should handle no unread messages', async () => {
      const receivingUserId = 1;
      const sendingUserId = 2;
      
      mockUpdateMany.mockResolvedValue({ count: 0 });

      await markChatAsRead({ receivingUserId, sendingUserId });

      expect(mockPrisma.message.updateMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle all messages already read', async () => {
      const receivingUserId = 1;
      const sendingUserId = 2;
      
      mockUpdateMany.mockResolvedValue({ count: 0 });

      await markChatAsRead({ receivingUserId, sendingUserId });

      expect(mockPrisma.message.updateMany).toHaveBeenCalledTimes(1);
      const callArgs = mockUpdateMany.mock.calls[0][0];
      
      expect(callArgs?.where).toHaveProperty('read', false);
    });

    it('should handle multiple messages needing update', async () => {
      const receivingUserId = 1;
      const sendingUserId = 2;
      
      mockUpdateMany.mockResolvedValue({ count: 10 });

      await markChatAsRead({ receivingUserId, sendingUserId });

      expect(mockPrisma.message.updateMany).toHaveBeenCalledTimes(1);
    });

    it('should handle different user pairs', async () => {
      const testCases = [
        { receivingUserId: 1, sendingUserId: 2 },
        { receivingUserId: 5, sendingUserId: 10 },
        { receivingUserId: 100, sendingUserId: 200 },
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        mockUpdateMany.mockResolvedValue({ count: 1 });

        await markChatAsRead(testCase);

        expect(mockPrisma.message.updateMany).toHaveBeenCalledTimes(1);
        const callArgs = mockUpdateMany.mock.calls[0][0];
        
        expect(callArgs?.where?.sentById).toBe(testCase.sendingUserId);
        expect(callArgs?.where?.sentToId).toBe(testCase.receivingUserId);
      }
    });
  });
});
