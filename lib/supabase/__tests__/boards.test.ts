/**
 * @jest-environment node
 */
import {
  getBoard,
  getBoardId,
  createBoard,
  addCard,
  updateCard,
  deleteCard,
  addColumn,
  updateColumn,
  deleteColumn,
  moveCard,
} from '../boards'
import { createClient } from '../server'

// Mock the server client
jest.mock('../server', () => ({
  createClient: jest.fn(),
}))

describe('Board Server Actions', () => {
  let mockSupabaseClient: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Create a fresh mock client for each test
    mockSupabaseClient = {
      from: jest.fn(),
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabaseClient)
  })

  describe('getBoard', () => {
    it('retrieves board with columns and cards', async () => {
      const mockBoard = { id: 'board_1', organization_id: 'org_1', name: 'Test Board' }
      const mockColumns = [
        { id: 'col_1', board_id: 'board_1', title: 'TODO', color: '#ef4444', position: 0 },
        { id: 'col_2', board_id: 'board_1', title: 'Done', color: '#10b981', position: 1 },
      ]
      const mockCards = [
        {
          id: 'card_1',
          board_id: 'board_1',
          column_id: 'col_1',
          title: 'Test Card',
          description: 'Description',
          notes: 'Notes',
          position: 0,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ]

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'boards') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockBoard, error: null }),
          }
        }
        if (table === 'columns') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockColumns, error: null }),
          }
        }
        if (table === 'cards') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockCards, error: null }),
          }
        }
      })

      const result = await getBoard('org_1')

      expect(result).not.toBeNull()
      expect(result?.columns).toHaveLength(2)
      expect(result?.cards).toHaveProperty('card_1')
      expect(result?.columns[0].cardIds).toContain('card_1')
    })

    it('returns null when board not found', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      })

      const result = await getBoard('org_nonexistent')
      expect(result).toBeNull()
    })

    it('handles database errors gracefully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } }),
      })

      const result = await getBoard('org_1')
      expect(result).toBeNull()
    })
  })

  describe('getBoardId', () => {
    it('returns board ID for organization', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { id: 'board_123' }, error: null }),
      })

      const result = await getBoardId('org_1')
      expect(result).toBe('board_123')
    })

    it('returns null when no board exists', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      })

      const result = await getBoardId('org_nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('createBoard', () => {
    it('creates a new board successfully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: { id: 'board_new', name: 'New Board' }, error: null }),
      })

      const result = await createBoard('org_1', 'New Board', 'user_1')
      expect(result).toBe('board_new')
    })

    it('returns null on creation error', async () => {
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } }),
      })

      const result = await createBoard('org_1', 'New Board', 'user_1')
      expect(result).toBeNull()
    })
  })

  describe('addCard', () => {
    it('adds a new card to a column', async () => {
      // Mock getting max position
      const maxPositionMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { position: 2 }, error: null }),
      }

      // Mock insert
      const insertMock = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'card_new',
            title: 'New Card',
            description: 'Description',
            notes: null,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          error: null,
        }),
      }

      let callCount = 0
      mockSupabaseClient.from.mockImplementation(() => {
        callCount++
        return callCount === 1 ? maxPositionMock : insertMock
      })

      const result = await addCard('board_1', 'col_1', { title: 'New Card', description: 'Description' }, 'user_1')

      expect(result).not.toBeNull()
      expect(result?.title).toBe('New Card')
      expect(result?.id).toBe('card_new')
    })

    it('assigns position 0 when column is empty', async () => {
      const maxPositionMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }

      const insertMock = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'card_new',
            title: 'First Card',
            description: null,
            notes: null,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          error: null,
        }),
      }

      let callCount = 0
      mockSupabaseClient.from.mockImplementation(() => {
        callCount++
        return callCount === 1 ? maxPositionMock : insertMock
      })

      const result = await addCard('board_1', 'col_1', { title: 'First Card' })
      expect(result).not.toBeNull()
    })
  })

  describe('updateCard', () => {
    it('updates card successfully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      })

      const result = await updateCard('card_1', { title: 'Updated Title' })
      expect(result).toBe(true)
    })

    it('returns false on update error', async () => {
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
      })

      const result = await updateCard('card_1', { title: 'Updated Title' })
      expect(result).toBe(false)
    })
  })

  describe('deleteCard', () => {
    it('deletes card successfully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      })

      const result = await deleteCard('card_1')
      expect(result).toBe(true)
    })

    it('returns false on delete error', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
      })

      const result = await deleteCard('card_1')
      expect(result).toBe(false)
    })
  })

  describe('addColumn', () => {
    it('adds a new column to board', async () => {
      const maxPositionMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { position: 1 }, error: null }),
      }

      const insertMock = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'col_new',
            title: 'New Column',
            color: '#3b82f6',
          },
          error: null,
        }),
      }

      let callCount = 0
      mockSupabaseClient.from.mockImplementation(() => {
        callCount++
        return callCount === 1 ? maxPositionMock : insertMock
      })

      const result = await addColumn('board_1', 'New Column', '#3b82f6')

      expect(result).not.toBeNull()
      expect(result?.title).toBe('New Column')
      expect(result?.cardIds).toEqual([])
    })
  })

  describe('updateColumn', () => {
    it('updates column successfully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      })

      const result = await updateColumn('col_1', { title: 'Updated Column' })
      expect(result).toBe(true)
    })
  })

  describe('deleteColumn', () => {
    it('deletes column successfully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      })

      const result = await deleteColumn('col_1')
      expect(result).toBe(true)
    })
  })

  describe('moveCard', () => {
    it('reorders card within same column (moving down)', async () => {
      const cardFetchMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { column_id: 'col_1', position: 0, board_id: 'board_1' },
          error: null,
        }),
      }

      const allCardsMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [
            { id: 'card_1', position: 0 },
            { id: 'card_2', position: 1 },
            { id: 'card_3', position: 2 },
          ],
          error: null,
        }),
      }

      const updateMock = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      }

      let callCount = 0
      mockSupabaseClient.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) return cardFetchMock
        if (callCount === 2) return allCardsMock
        return updateMock
      })

      const result = await moveCard('card_1', 'col_1', 2)
      expect(result).toBe(true)
    })

    it('moves card to different column', async () => {
      const cardFetchMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { column_id: 'col_1', position: 0, board_id: 'board_1' },
          error: null,
        }),
      }

      const oldColumnCardsMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockResolvedValue({
          data: [{ id: 'card_2', position: 1 }],
          error: null,
        }),
      }

      const newColumnCardsMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockResolvedValue({
          data: [{ id: 'card_3', position: 0 }],
          error: null,
        }),
      }

      const updateMock = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      }

      let callCount = 0
      mockSupabaseClient.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) return cardFetchMock
        if (callCount === 2) return oldColumnCardsMock
        if (callCount === 3) return updateMock
        if (callCount === 4) return newColumnCardsMock
        return updateMock
      })

      const result = await moveCard('card_1', 'col_2', 0)
      expect(result).toBe(true)
    })

    it('returns true when card is already in correct position', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { column_id: 'col_1', position: 0, board_id: 'board_1' },
          error: null,
        }),
      })

      const result = await moveCard('card_1', 'col_1', 0)
      expect(result).toBe(true)
    })

    it('returns false when card not found', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      })

      const result = await moveCard('card_nonexistent', 'col_1', 0)
      expect(result).toBe(false)
    })
  })
})
