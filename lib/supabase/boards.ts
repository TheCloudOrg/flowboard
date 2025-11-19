'use server';

import { createClient } from './server';
import { Database } from './types';
import { Board, Card, Column } from '@/types';

type DBCard = Database['public']['Tables']['cards']['Row'];
type DBColumn = Database['public']['Tables']['columns']['Row'];
type DBBoard = Database['public']['Tables']['boards']['Row'];

/**
 * Get board with all columns and cards for an organization
 * Returns same structure as localStorage for compatibility
 */
export async function getBoard(organizationId: string): Promise<Board | null> {
  const supabase = await createClient();

  // Get board for organization
  const { data: boards, error: boardError } = await supabase
    .from('boards')
    .select('*')
    .eq('organization_id', organizationId)
    .limit(1)
    .single();

  if (boardError || !boards) {
    return null;
  }

  const board = boards as DBBoard;
  const boardId = board.id;

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

  const columns = (columnsData || []) as DBColumn[];

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

  const cards = (cardsData || []) as DBCard[];

  // Transform to localStorage-compatible format
  const cardsMap: { [key: string]: Card } = {};
  cards.forEach((card) => {
    cardsMap[card.id] = {
      id: card.id,
      title: card.title,
      description: card.description || undefined,
      notes: card.notes || undefined,
      createdAt: card.created_at,
      updatedAt: card.updated_at,
    };
  });

  const columnsArray: Column[] = columns.map((col) => ({
    id: col.id,
    title: col.title,
    color: col.color || undefined,
    cardIds: cards
      .filter((card) => card.column_id === col.id)
      .sort((a, b) => a.position - b.position)
      .map((card) => card.id),
  }));

  return {
    columns: columnsArray,
    cards: cardsMap,
  };
}

/**
 * Get board ID for organization (helper function)
 */
export async function getBoardId(organizationId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('boards')
    .select('id')
    .eq('organization_id', organizationId)
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return (data as { id: string }).id;
}

/**
 * Create a new board for an organization
 */
export async function createBoard(
  organizationId: string,
  name: string,
  createdBy: string
): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('boards')
    .insert({
      organization_id: organizationId,
      name,
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating board:', error);
    return null;
  }

  return data.id;
}

/**
 * Add a card to a column
 */
export async function addCard(
  boardId: string,
  columnId: string,
  card: { title: string; description?: string; notes?: string },
  createdBy?: string
): Promise<Card | null> {
  const supabase = await createClient();

  // Get max position in column
  const { data: maxData } = await supabase
    .from('cards')
    .select('position')
    .eq('column_id', columnId)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const newPosition = (maxData?.position ?? -1) + 1;

  // Insert card
  const { data, error } = await supabase
    .from('cards')
    .insert({
      board_id: boardId,
      column_id: columnId,
      title: card.title,
      description: card.description || null,
      notes: card.notes || null,
      position: newPosition,
      created_by: createdBy || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding card:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description || undefined,
    notes: data.notes || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Update a card
 */
export async function updateCard(
  cardId: string,
  updates: { title?: string; description?: string; notes?: string }
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('cards')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cardId);

  if (error) {
    console.error('Error updating card:', error);
    return false;
  }

  return true;
}

/**
 * Delete a card
 */
export async function deleteCard(cardId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from('cards').delete().eq('id', cardId);

  if (error) {
    console.error('Error deleting card:', error);
    return false;
  }

  return true;
}

/**
 * Add a column to a board
 */
export async function addColumn(
  boardId: string,
  title: string,
  color?: string
): Promise<Column | null> {
  const supabase = await createClient();

  // Get max position
  const { data: maxData } = await supabase
    .from('columns')
    .select('position')
    .eq('board_id', boardId)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const newPosition = (maxData?.position ?? -1) + 1;

  // Insert column
  const { data, error } = await supabase
    .from('columns')
    .insert({
      board_id: boardId,
      title,
      color: color || null,
      position: newPosition,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding column:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    color: data.color || undefined,
    cardIds: [],
  };
}

/**
 * Update a column
 */
export async function updateColumn(
  columnId: string,
  updates: { title?: string; color?: string }
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from('columns').update(updates).eq('id', columnId);

  if (error) {
    console.error('Error updating column:', error);
    return false;
  }

  return true;
}

/**
 * Delete a column and all its cards
 */
export async function deleteColumn(columnId: string): Promise<boolean> {
  const supabase = await createClient();

  // Cards will be deleted automatically via CASCADE
  const { error } = await supabase.from('columns').delete().eq('id', columnId);

  if (error) {
    console.error('Error deleting column:', error);
    return false;
  }

  return true;
}

/**
 * Move a card to a different column or reorder within same column
 */
export async function moveCard(
  cardId: string,
  newColumnId: string,
  newPosition: number
): Promise<boolean> {
  const supabase = await createClient();

  console.log('🔄 moveCard called:', { cardId, newColumnId, newPosition });

  // Get current card info
  const { data: card, error: fetchError } = await supabase
    .from('cards')
    .select('column_id, position, board_id')
    .eq('id', cardId)
    .single();

  if (fetchError) {
    console.error('❌ Error fetching card:', fetchError);
    return false;
  }

  if (!card) {
    console.error('❌ Card not found:', cardId);
    return false;
  }

  const oldColumnId = card.column_id;
  const oldPosition = card.position;

  console.log('📍 Current position:', { oldColumnId, oldPosition });

  if (oldColumnId === newColumnId) {
    // Reordering within same column
    if (oldPosition === newPosition) return true;

    // Fetch all cards in the column
    const { data: allCards } = await supabase
      .from('cards')
      .select('id, position')
      .eq('column_id', oldColumnId)
      .order('position', { ascending: true });

    if (!allCards) return false;

    // Update positions for affected cards
    if (oldPosition < newPosition) {
      // Moving down: shift cards between old and new position up
      for (const c of allCards) {
        if (c.position > oldPosition && c.position <= newPosition) {
          await supabase
            .from('cards')
            .update({ position: c.position - 1 })
            .eq('id', c.id);
        }
      }
    } else {
      // Moving up: shift cards between new and old position down
      for (const c of allCards) {
        if (c.position >= newPosition && c.position < oldPosition) {
          await supabase
            .from('cards')
            .update({ position: c.position + 1 })
            .eq('id', c.id);
        }
      }
    }

    // Update card position
    const { error } = await supabase
      .from('cards')
      .update({ position: newPosition })
      .eq('id', cardId);

    if (error) {
      console.error('Error reordering card:', error);
      return false;
    }
  } else {
    // Moving to different column

    // Fetch all cards in old column
    const { data: oldColumnCards } = await supabase
      .from('cards')
      .select('id, position')
      .eq('column_id', oldColumnId)
      .gt('position', oldPosition);

    // Shift cards in old column up
    if (oldColumnCards) {
      for (const c of oldColumnCards) {
        await supabase
          .from('cards')
          .update({ position: c.position - 1 })
          .eq('id', c.id);
      }
    }

    // Fetch all cards in new column
    const { data: newColumnCards } = await supabase
      .from('cards')
      .select('id, position')
      .eq('column_id', newColumnId)
      .gte('position', newPosition);

    // Shift cards in new column down
    if (newColumnCards) {
      for (const c of newColumnCards) {
        await supabase
          .from('cards')
          .update({ position: c.position + 1 })
          .eq('id', c.id);
      }
    }

    // Move card to new column and position
    const { error } = await supabase
      .from('cards')
      .update({
        column_id: newColumnId,
        position: newPosition,
      })
      .eq('id', cardId);

    if (error) {
      console.error('❌ Error moving card:', error);
      return false;
    }

    console.log('✅ Card moved successfully to new column');
  }

  console.log('✅ moveCard completed successfully');
  return true;
}
