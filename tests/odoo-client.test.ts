import { OdooShClient } from '../src/odoo-client';

describe('OdooShClient', () => {
  describe('Configuration', () => {
    it('should create client with valid config', () => {
      const client = new OdooShClient({
        apiToken: 'test-token',
        apiUrl: 'https://test.odoo.sh/api',
        timeout: 5000,
        enableCache: true,
        cacheTTL: 60,
      });

      expect(client).toBeInstanceOf(OdooShClient);
    });

    it('should throw error with invalid config', () => {
      expect(() => {
        new OdooShClient({
          apiToken: '',  // Empty token should fail
          apiUrl: 'https://test.odoo.sh/api',
        } as any);
      }).toThrow();
    });
  });

  describe('Cache', () => {
    it('should cache requests when enabled', async () => {
      // Mock implementation to be added
      // This is a placeholder for future cache tests
    });

    it('should bypass cache when disabled', async () => {
      // Mock implementation to be added
      // This is a placeholder for future cache tests
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 authentication errors', async () => {
      // Mock implementation to be added
      // This is a placeholder for future error handling tests
    });

    it('should handle 404 not found errors', async () => {
      // Mock implementation to be added
      // This is a placeholder for future error handling tests
    });

    it('should handle rate limit errors', async () => {
      // Mock implementation to be added
      // This is a placeholder for future error handling tests
    });
  });
});

// TODO: Add integration tests with mocked axios responses
// TODO: Add tests for each API method (listProjects, getBranch, etc.)
// TODO: Add tests for cache expiration and clearing
