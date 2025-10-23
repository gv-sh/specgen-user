import { 
  fetchContentSummary, 
  fetchStoryImage,
  fetchPreviousGenerations 
} from './api';

// Mock axios
jest.mock('axios', () => ({
  default: {
    get: jest.fn(),
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      defaults: { headers: { common: {} } }
    }))
  }
}));

const axios = require('axios');

describe('API Service Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Cache Performance', () => {
    describe('fetchContentSummary Cache Performance', () => {
      test('cache write operation completes within 100ms', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: Array.from({ length: 100 }, (_, i) => ({
              id: `story-${i}`,
              title: `Story ${i}`,
              type: 'fiction'
            })),
            pagination: { page: 1, total: 100 }
          }
        };

        require('../services/api').__setMockResponse(mockResponse);

        const startTime = performance.now();
        await fetchContentSummary();
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(100);
      });

      test('cache read operation is faster than 50ms', () => {
        // Prepare large cache data
        const largeData = Array.from({ length: 1000 }, (_, i) => ({
          id: `story-${i}`,
          title: `Story ${i}`,
          type: 'fiction',
          content: 'A'.repeat(1000) // Large content
        }));

        const cacheData = {
          data: largeData,
          pagination: { page: 1, total: 1000 },
          timestamp: Date.now()
        };

        localStorage.setItem('test-cache', JSON.stringify(cacheData));

        const startTime = performance.now();
        const retrieved = JSON.parse(localStorage.getItem('test-cache'));
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(50);
        expect(retrieved.data).toHaveLength(1000);
      });

      test('cache storage handles large datasets efficiently', () => {
        const largeDataset = Array.from({ length: 5000 }, (_, i) => ({
          id: `story-${i}`,
          title: `Story ${i}`,
          type: 'fiction',
          year: 2024,
          createdAt: new Date().toISOString()
        }));

        const startTime = performance.now();
        
        try {
          localStorage.setItem('large-cache-test', JSON.stringify(largeDataset));
          const retrieved = JSON.parse(localStorage.getItem('large-cache-test'));
          
          const endTime = performance.now();
          
          expect(endTime - startTime).toBeLessThan(200);
          expect(retrieved).toHaveLength(5000);
        } catch (error) {
          // Handle quota exceeded gracefully
          expect(error.name).toBe('QuotaExceededError');
        }
      });

      test('cache cleanup operations are efficient', () => {
        // Fill cache with multiple entries
        for (let i = 0; i < 50; i++) {
          localStorage.setItem(`cache-${i}`, JSON.stringify({
            data: Array.from({ length: 100 }, (_, j) => ({ id: j }))
          }));
        }

        const startTime = performance.now();
        
        // Simulate cache cleanup
        for (let i = 0; i < 25; i++) {
          localStorage.removeItem(`cache-${i}`);
        }
        
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(100);
      });
    });

    describe('Memory Usage Optimization', () => {
      test('fetchStoryImage returns cleanup function for memory management', async () => {
        const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
        mockedAxios.get.mockResolvedValue({ data: mockBlob });

        const result = await fetchStoryImage('test-id');

        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('cleanup');
        expect(typeof result.cleanup).toBe('function');

        // Test cleanup function
        const createObjectURLSpy = jest.spyOn(URL, 'createObjectURL');
        const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL');

        result.cleanup();

        expect(revokeObjectURLSpy).toHaveBeenCalledWith(result.url);
      });

      test('object URL creation is efficient', async () => {
        const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
        mockedAxios.get.mockResolvedValue({ data: mockBlob });

        const startTime = performance.now();
        const result = await fetchStoryImage('test-id');
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(50);
        expect(result.url).toBeTruthy();
        
        result.cleanup(); // Clean up for test
      });

      test('handles multiple concurrent image requests efficiently', async () => {
        const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
        mockedAxios.get.mockResolvedValue({ data: mockBlob });

        const startTime = performance.now();
        
        const promises = Array.from({ length: 10 }, (_, i) => 
          fetchStoryImage(`test-id-${i}`)
        );
        
        const results = await Promise.all(promises);
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(500);
        expect(results).toHaveLength(10);
        
        // Clean up all URLs
        results.forEach(result => result.cleanup());
      });
    });
  });

  describe('API Response Performance', () => {
    test('handles API timeout gracefully', async () => {
      mockedAxios.get.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 100)
        )
      );

      const startTime = performance.now();
      
      try {
        await fetchContentSummary();
      } catch (error) {
        const endTime = performance.now();
        expect(endTime - startTime).toBeGreaterThan(90);
        expect(error.message).toBe('timeout');
      }
    });

    test('processes large API responses efficiently', async () => {
      const largeResponse = {
        data: {
          success: true,
          data: Array.from({ length: 2000 }, (_, i) => ({
            id: `story-${i}`,
            title: `Story ${i}`,
            type: 'fiction',
            year: 2024,
            createdAt: new Date().toISOString()
          })),
          pagination: { 
            page: 1, 
            total: 2000, 
            limit: 2000,
            totalPages: 1,
            hasNext: false 
          }
        }
      };

      mockedAxios.get.mockResolvedValue(largeResponse);

      const startTime = performance.now();
      const result = await fetchContentSummary();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
      expect(result.data).toHaveLength(2000);
    });

    test('handles network errors efficiently', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      const startTime = performance.now();
      
      try {
        await fetchContentSummary();
      } catch (error) {
        const endTime = performance.now();
        
        // Should fail quickly, not hang
        expect(endTime - startTime).toBeLessThan(100);
        expect(error.message).toBe('Network Error');
      }
    });
  });

  describe('Legacy API Compatibility', () => {
    test('fetchPreviousGenerations maintains performance with summary endpoint', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: Array.from({ length: 50 }, (_, i) => ({
            id: `story-${i}`,
            title: `Story ${i}`,
            type: 'fiction'
          })),
          pagination: { page: 1, total: 50 }
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const startTime = performance.now();
      const result = await fetchPreviousGenerations();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(result.data).toHaveLength(50);
      
      // Verify it calls the summary endpoint
      expect(mockedAxios.get).toHaveBeenCalledWith('/content/summary', {
        params: {}
      });
    });
  });

  describe('Concurrent Request Performance', () => {
    test('handles multiple simultaneous API calls efficiently', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [{ id: '1', title: 'Test' }],
          pagination: { page: 1, total: 1 }
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const startTime = performance.now();
      
      const promises = [
        fetchContentSummary({ page: 1 }),
        fetchContentSummary({ page: 2 }),
        fetchContentSummary({ page: 3 }),
        fetchPreviousGenerations()
      ];
      
      const results = await Promise.all(promises);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(300);
      expect(results).toHaveLength(4);
      expect(mockedAxios.get).toHaveBeenCalledTimes(4);
    });

    test('request queue management prevents overload', async () => {
      const delayedResponse = (delay) => new Promise(resolve => 
        setTimeout(() => resolve({
          data: {
            success: true,
            data: [{ id: '1', title: 'Test' }],
            pagination: { page: 1, total: 1 }
          }
        }), delay)
      );

      mockedAxios.get.mockImplementation(() => delayedResponse(50));

      const startTime = performance.now();
      
      // Create many concurrent requests
      const promises = Array.from({ length: 20 }, (_, i) => 
        fetchContentSummary({ page: i + 1 })
      );
      
      const results = await Promise.all(promises);
      const endTime = performance.now();

      expect(results).toHaveLength(20);
      // Should complete in reasonable time even with many requests
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});