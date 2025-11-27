'use server';

import { revalidatePath } from 'next/cache';
import { auth, currentUser } from '@clerk/nextjs/server';
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
} from '@/lib/supabase/boards';
import {
  migrateLocalStorageToSupabase,
  createDefaultBoard,
} from '@/lib/migration/migrateToSupabase';
import {
  validateAndSanitizeCard,
  validateAndSanitizeColumn,
  validateCardInput,
  validateColumnInput,
} from '@/lib/validation';
import { Board, Card, Column } from '@/types';

/**
 * Get the current organization's board
 */
export async function getBoardAction(organizationId: string): Promise<Board | null> {
  try {
    const board = await getSupabaseBoard(organizationId);
    return board;
  } catch (error) {
    console.error('Error getting board:', error);
    return null;
  }
}

/**
 * Get the board ID for an organization
 */
export async function getBoardIdAction(organizationId: string): Promise<string | null> {
  try {
    const boardId = await getBoardId(organizationId);
    return boardId;
  } catch (error) {
    console.error('Error getting board ID:', error);
    return null;
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
    const user = await currentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if board already exists
    const existingBoardId = await getBoardId(organizationId);
    if (existingBoardId) {
      return { success: true, boardId: existingBoardId };
    }

    // If localStorage data exists, migrate it
    if (localStorageData && localStorageData.columns.length > 0) {
      const result = await migrateLocalStorageToSupabase(organizationId, user.id, localStorageData);
      return result;
    }

    // Otherwise create default board
    const result = await createDefaultBoard(organizationId, user.id);
    return result;
  } catch (error: any) {
    console.error('Error initializing board:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add a new card to a column
 */
export async function addCardAction(
  boardId: string,
  columnId: string,
  card: { title: string; description?: string; techStack?: string; notes?: string }
): Promise<Card | null> {
  try {
    const user = await currentUser();
    const userId = user?.id;

    // SEC-006 FIX: Validate and sanitize card input
    const sanitizedCard = validateAndSanitizeCard(card);

    const newCard = await addSupabaseCard(boardId, columnId, sanitizedCard, userId);
    revalidatePath('/');
    return newCard;
  } catch (error) {
    console.error('Error adding card:', error);
    return null;
  }
}

/**
 * Update a card
 */
export async function updateCardAction(
  cardId: string,
  updates: { title?: string; description?: string; techStack?: string; notes?: string }
): Promise<boolean> {
  try {
    // SEC-006 FIX: Validate card input before updating
    const validation = validateCardInput(updates);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const success = await updateSupabaseCard(cardId, updates);
    revalidatePath('/');
    return success;
  } catch (error) {
    console.error('Error updating card:', error);
    return false;
  }
}

/**
 * Delete a card
 */
export async function deleteCardAction(cardId: string): Promise<boolean> {
  try {
    const success = await deleteSupabaseCard(cardId);
    revalidatePath('/');
    return success;
  } catch (error) {
    console.error('Error deleting card:', error);
    return false;
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
    // SEC-006 FIX: Validate and sanitize column input
    const sanitizedColumn = validateAndSanitizeColumn({ title });

    const newColumn = await addSupabaseColumn(boardId, sanitizedColumn.title, color);
    revalidatePath('/');
    return newColumn;
  } catch (error) {
    console.error('Error adding column:', error);
    return null;
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
    // SEC-006 FIX: Validate column input before updating
    if (updates.title) {
      const validation = validateColumnInput({ title: updates.title });
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }

    const success = await updateSupabaseColumn(columnId, updates);
    revalidatePath('/');
    return success;
  } catch (error) {
    console.error('Error updating column:', error);
    return false;
  }
}

/**
 * Delete a column and all its cards
 */
export async function deleteColumnAction(columnId: string): Promise<boolean> {
  try {
    const success = await deleteSupabaseColumn(columnId);
    revalidatePath('/');
    return success;
  } catch (error) {
    console.error('Error deleting column:', error);
    return false;
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
    const success = await moveSupabaseCard(cardId, newColumnId, newPosition);
    revalidatePath('/');
    return success;
  } catch (error) {
    console.error('Error moving card:', error);
    return false;
  }
}

/**
 * Get all boards for an organization
 */
export async function getAllBoardsAction(
  organizationId: string
): Promise<{ id: string; name: string; created_at: string }[]> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('boards')
      .select('id, name, created_at')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting boards:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting boards:', error);
    return [];
  }
}

/**
 * Get a specific board by ID
 */
export async function getBoardByIdAction(boardId: string): Promise<Board | null> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // Get board
    const { data: boardData, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('id', boardId)
      .single();

    if (boardError || !boardData) {
      return null;
    }

    // Get columns ordered by position
    const { data: columnsData, error: columnsError } = await supabase
      .from('columns')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true });

    if (columnsError) {
      console.error('Error fetching columns:', columnsError);
      return null;
    }

    const columns = columnsData || [];

    // Get all cards for this board
    const { data: cardsData, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true });

    if (cardsError) {
      console.error('Error fetching cards:', cardsError);
      return null;
    }

    const cards = cardsData || [];

    // Transform to format
    const cardsMap: { [key: string]: Card } = {};
    cards.forEach((card: any) => {
      cardsMap[card.id] = {
        id: card.id,
        title: card.title,
        description: card.description || undefined,
        techStack: card.tech_stack || undefined,
        notes: card.notes || undefined,
        createdAt: card.created_at,
        updatedAt: card.updated_at,
      };
    });

    const columnsArray: Column[] = columns.map((col: any) => ({
      id: col.id,
      title: col.title,
      color: col.color || undefined,
      cardIds: cards
        .filter((card: any) => card.column_id === col.id)
        .sort((a: any, b: any) => a.position - b.position)
        .map((card: any) => card.id),
    }));

    return {
      columns: columnsArray,
      cards: cardsMap,
    };
  } catch (error) {
    console.error('Error getting board:', error);
    return null;
  }
}

/**
 * Create a new board for an organization
 */
export async function createBoardAction(
  organizationId: string,
  name: string
): Promise<{ success: boolean; boardId?: string; error?: string }> {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const boardId = await createBoard(organizationId, name, user.id);

    if (!boardId) {
      return { success: false, error: 'Failed to create board' };
    }

    // Create default columns for the new board
    await addSupabaseColumn(boardId, 'TODO', '#a855f7');
    await addSupabaseColumn(boardId, 'In Progress', '#3b82f6');
    await addSupabaseColumn(boardId, 'Completed', '#10b981');

    revalidatePath('/');
    return { success: true, boardId };
  } catch (error: any) {
    console.error('Error creating board:', error);
    return { success: false, error: error.message };
  }
}
