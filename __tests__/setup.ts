// Mock createClient from utils/supabase/server so no real DB calls are made
jest.mock('@/utils/supabase/server');

// Suppress expected console.error output during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});
