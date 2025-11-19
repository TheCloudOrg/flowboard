'use server';

import { createBoard, addColumn, addCard } from '../supabase/boards';
import { Board as LocalStorageBoard } from '@/types';

export interface MigrationResult {
  success: boolean;
  boardId?: string;
  stats?: {
    columns: number;
    cards: number;
  };
  error?: string;
}

/**
 * Migrate localStorage board data to Supabase
 * @param organizationId - User's current organization ID
 * @param userId - User ID (for board creation)
 * @param localStorageData - Board data from localStorage
 * @returns Migration result with success status and stats
 */
export async function migrateLocalStorageToSupabase(
  organizationId: string,
  userId: string,
  localStorageData: LocalStorageBoard
): Promise<MigrationResult> {
  try {
    // Validate input
    if (!localStorageData.columns || localStorageData.columns.length === 0) {
      return {
        success: false,
        error: 'No columns found in localStorage data',
      };
    }

    // Step 1: Create board
    const boardId = await createBoard(organizationId, 'Main Board', userId);
    if (!boardId) {
      return {
        success: false,
        error: 'Failed to create board in Supabase',
      };
    }

    console.log(`✅ Board created: ${boardId}`);

    let totalColumns = 0;
    let totalCards = 0;

    // Step 2: Migrate columns
    const columnIdMap = new Map<string, string>(); // localStorage ID → Supabase ID

    for (const column of localStorageData.columns) {
      const newColumn = await addColumn(boardId, column.title, column.color);

      if (!newColumn) {
        console.error(`Failed to create column: ${column.title}`);
        continue;
      }

      columnIdMap.set(column.id, newColumn.id);
      totalColumns++;

      console.log(`✅ Column migrated: ${column.title} (${column.cardIds.length} cards)`);

      // Step 3: Migrate cards for this column
      for (const cardId of column.cardIds) {
        const card = localStorageData.cards[cardId];

        if (!card) {
          console.warn(`Card ${cardId} not found in cards object`);
          continue;
        }

        const newCard = await addCard(
          boardId,
          newColumn.id,
          {
            title: card.title,
            description: card.description,
            notes: card.notes,
          },
          userId
        );

        if (!newCard) {
          console.error(`Failed to create card: ${card.title}`);
          continue;
        }

        totalCards++;
      }
    }

    console.log(`✅ Migration complete: ${totalColumns} columns, ${totalCards} cards`);

    return {
      success: true,
      boardId,
      stats: {
        columns: totalColumns,
        cards: totalCards,
      },
    };
  } catch (error: any) {
    console.error('Migration error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error during migration',
    };
  }
}

/**
 * Create a default board with empty columns (for new users)
 */
export async function createDefaultBoard(
  organizationId: string,
  userId: string
): Promise<MigrationResult> {
  try {
    const boardId = await createBoard(organizationId, 'Main Board', userId);
    if (!boardId) {
      return {
        success: false,
        error: 'Failed to create default board',
      };
    }

    // Create default columns
    const defaultColumns = [
      { title: 'TODO', color: '#8b5cf6' },
      { title: 'In Progress', color: '#3b82f6' },
      { title: 'Completed', color: '#10b981' },
    ];

    for (const col of defaultColumns) {
      await addColumn(boardId, col.title, col.color);
    }

    console.log('✅ Default board created with 3 columns');

    return {
      success: true,
      boardId,
      stats: {
        columns: 3,
        cards: 0,
      },
    };
  } catch (error: any) {
    console.error('Error creating default board:', error);
    return {
      success: false,
      error: error.message || 'Failed to create default board',
    };
  }
}
