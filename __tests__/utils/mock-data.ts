import { Card, Column, Board } from '@/types'

// Mock user
export const mockUser = {
  id: 'user_test123',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: new Date('2024-01-01').toISOString(),
  updated_at: new Date('2024-01-01').toISOString(),
}

// Mock organization
export const mockOrganization = {
  id: 'org_test123',
  name: 'Test Organization',
  slug: 'test-org',
  created_by: mockUser.id,
  created_at: new Date('2024-01-01').toISOString(),
  updated_at: new Date('2024-01-01').toISOString(),
}

// Mock board
export const mockBoard: Board = {
  id: 'board_test123',
  organization_id: mockOrganization.id,
  name: 'Test Board',
  description: 'A test board for unit tests',
  created_by: mockUser.id,
  created_at: new Date('2024-01-01').toISOString(),
  updated_at: new Date('2024-01-01').toISOString(),
  columns: [],
}

// Mock columns
export const mockColumns: Column[] = [
  {
    id: 'col_1',
    board_id: mockBoard.id,
    title: 'TODO',
    color: '#ef4444',
    position: 0,
    cards: [],
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'col_2',
    board_id: mockBoard.id,
    title: 'In Progress',
    color: '#f59e0b',
    position: 1,
    cards: [],
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'col_3',
    board_id: mockBoard.id,
    title: 'Completed',
    color: '#10b981',
    position: 2,
    cards: [],
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date('2024-01-01').toISOString(),
  },
]

// Mock cards
export const mockCards: Card[] = [
  {
    id: 'card_1',
    column_id: 'col_1',
    board_id: mockBoard.id,
    title: 'Test Card 1',
    description: 'This is a test card',
    notes: 'Some notes',
    position: 0,
    created_by: mockUser.id,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'card_2',
    column_id: 'col_1',
    board_id: mockBoard.id,
    title: 'Test Card 2',
    description: 'Another test card',
    notes: '',
    position: 1,
    created_by: mockUser.id,
    created_at: new Date('2024-01-02').toISOString(),
    updated_at: new Date('2024-01-02').toISOString(),
  },
  {
    id: 'card_3',
    column_id: 'col_2',
    board_id: mockBoard.id,
    title: 'Test Card 3',
    description: 'Card in progress',
    notes: 'Working on it',
    position: 0,
    created_by: mockUser.id,
    created_at: new Date('2024-01-03').toISOString(),
    updated_at: new Date('2024-01-03').toISOString(),
  },
]

// Populate columns with cards
mockColumns[0].cards = [mockCards[0], mockCards[1]]
mockColumns[1].cards = [mockCards[2]]
mockColumns[2].cards = []

// Populate board with columns
mockBoard.columns = mockColumns

// Helper function to create a mock card
export const createMockCard = (overrides?: Partial<Card>): Card => ({
  id: `card_${Date.now()}`,
  column_id: 'col_1',
  board_id: mockBoard.id,
  title: 'Mock Card',
  description: 'Mock description',
  notes: '',
  position: 0,
  created_by: mockUser.id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

// Helper function to create a mock column
export const createMockColumn = (overrides?: Partial<Column>): Column => ({
  id: `col_${Date.now()}`,
  board_id: mockBoard.id,
  title: 'Mock Column',
  color: '#3b82f6',
  position: 0,
  cards: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

// Helper function to create a mock board
export const createMockBoard = (overrides?: Partial<Board>): Board => ({
  id: `board_${Date.now()}`,
  organization_id: mockOrganization.id,
  name: 'Mock Board',
  description: 'Mock description',
  created_by: mockUser.id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  columns: [],
  ...overrides,
})
