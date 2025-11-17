'use server'

import { revalidatePath } from 'next/cache'
import { auth, currentUser } from '@clerk/nextjs/server'
import {
  getBoard as getSupabaseBoard,
  getBoardId,
  createBoard,
  addCard as addSupabaseCard,
  updateCard as updateSupabaseCard,
  deleteCard as deleteSupabaseCard,
  addColumn as addSupabaseColumn,
  updateColumn as updateSupabaseColumn,
  deleteColumn as deleteSupabaseColumn,
  moveCard as moveSupabaseCard,
} from '@/lib/supabase/boards'
import {
  migrateLocalStorageToSupabase,
  createDefaultBoard,
} from '@/lib/migration/migrateToSupabase'
import { Board, Card, Column } from '@/types'

/**
 * Get the current organization's board
 */
export async function getBoardAction(organizationId: string): Promise<Board | null> {
  try {
    const board = await getSupabaseBoard(organizationId)
    return board
  } catch (error) {
    console.error('Error getting board:', error)
    return null
  }
}

/**
 * Get the board ID for an organization
 */
export async function getBoardIdAction(organizationId: string): Promise<string | null> {
  try {
    const boardId = await getBoardId(organizationId)
    return boardId
  } catch (error) {
    console.error('Error getting board ID:', error)
    return null
  }
}

/**
 * Initialize board (migrate from localStorage or create default)
 */
export async function initializeBoardAction(
  organizationId: string,
  localStorageData?: Board
): Promise<{ success: boolean; boardId?: string; error?: string }> {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Check if board already exists
    const existingBoardId = await getBoardId(organizationId)
    if (existingBoardId) {
      return { success: true, boardId: existingBoardId }
    }

    // If localStorage data exists, migrate it
    if (localStorageData && localStorageData.columns.length > 0) {
      const result = await migrateLocalStorageToSupabase(
        organizationId,
        user.id,
        localStorageData
      )
      return result
    }

    // Otherwise create default board
    const result = await createDefaultBoard(organizationId, user.id)
    return result
  } catch (error: any) {
    console.error('Error initializing board:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Add a new card to a column
 */
export async function addCardAction(
  boardId: string,
  columnId: string,
  card: { title: string; description?: string; notes?: string }
): Promise<Card | null> {
  try {
    const user = await currentUser()
    const userId = user?.id

    const newCard = await addSupabaseCard(boardId, columnId, card, userId)
    revalidatePath('/')
    return newCard
  } catch (error) {
    console.error('Error adding card:', error)
    return null
  }
}

/**
 * Update a card
 */
export async function updateCardAction(
  cardId: string,
  updates: { title?: string; description?: string; notes?: string }
): Promise<boolean> {
  try {
    const success = await updateSupabaseCard(cardId, updates)
    revalidatePath('/')
    return success
  } catch (error) {
    console.error('Error updating card:', error)
    return false
  }
}

/**
 * Delete a card
 */
export async function deleteCardAction(cardId: string): Promise<boolean> {
  try {
    const success = await deleteSupabaseCard(cardId)
    revalidatePath('/')
    return success
  } catch (error) {
    console.error('Error deleting card:', error)
    return false
  }
}

/**
 * Add a new column to the board
 */
export async function addColumnAction(
  boardId: string,
  title: string,
  color?: string
): Promise<Column | null> {
  try {
    const newColumn = await addSupabaseColumn(boardId, title, color)
    revalidatePath('/')
    return newColumn
  } catch (error) {
    console.error('Error adding column:', error)
    return null
  }
}

/**
 * Update a column
 */
export async function updateColumnAction(
  columnId: string,
  updates: { title?: string; color?: string }
): Promise<boolean> {
  try {
    const success = await updateSupabaseColumn(columnId, updates)
    revalidatePath('/')
    return success
  } catch (error) {
    console.error('Error updating column:', error)
    return false
  }
}

/**
 * Delete a column and all its cards
 */
export async function deleteColumnAction(columnId: string): Promise<boolean> {
  try {
    const success = await deleteSupabaseColumn(columnId)
    revalidatePath('/')
    return success
  } catch (error) {
    console.error('Error deleting column:', error)
    return false
  }
}

/**
 * Move a card to a different column or reorder within same column
 */
export async function moveCardAction(
  cardId: string,
  newColumnId: string,
  newPosition: number
): Promise<boolean> {
  try {
    const success = await moveSupabaseCard(cardId, newColumnId, newPosition)
    revalidatePath('/')
    return success
  } catch (error) {
    console.error('Error moving card:', error)
    return false
  }
}
