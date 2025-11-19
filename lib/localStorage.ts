import { Board, Column, Card } from '@/types';

const STORAGE_KEY = 'kanban-board';

const DEFAULT_BOARD: Board = {
  columns: [
    {
      id: 'todo',
      title: 'TODO',
      cardIds: [],
      color: '#8b5cf6',
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      cardIds: [],
      color: '#3b82f6',
    },
    {
      id: 'completed',
      title: 'Completed',
      cardIds: [],
      color: '#10b981',
    },
  ],
  cards: {},
};

export const getBoard = (): Board => {
  if (typeof window === 'undefined') return DEFAULT_BOARD;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_BOARD;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return DEFAULT_BOARD;
  }
};

export const saveBoard = (board: Board): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const addCard = (
  board: Board,
  columnId: string,
  card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>
): Board => {
  const newCard: Card = {
    ...card,
    id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const newBoard: Board = {
    ...board,
    cards: {
      ...board.cards,
      [newCard.id]: newCard,
    },
    columns: board.columns.map((col) =>
      col.id === columnId ? { ...col, cardIds: [...col.cardIds, newCard.id] } : col
    ),
  };

  saveBoard(newBoard);
  return newBoard;
};

export const updateCard = (board: Board, cardId: string, updates: Partial<Card>): Board => {
  const newBoard: Board = {
    ...board,
    cards: {
      ...board.cards,
      [cardId]: {
        ...board.cards[cardId],
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    },
  };

  saveBoard(newBoard);
  return newBoard;
};

export const deleteCard = (board: Board, cardId: string): Board => {
  const { [cardId]: deletedCard, ...remainingCards } = board.cards;

  const newBoard: Board = {
    ...board,
    cards: remainingCards,
    columns: board.columns.map((col) => ({
      ...col,
      cardIds: col.cardIds.filter((id) => id !== cardId),
    })),
  };

  saveBoard(newBoard);
  return newBoard;
};

export const addColumn = (board: Board, title: string, color?: string): Board => {
  const newColumn: Column = {
    id: `column-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    cardIds: [],
    color,
  };

  const newBoard: Board = {
    ...board,
    columns: [...board.columns, newColumn],
  };

  saveBoard(newBoard);
  return newBoard;
};

export const updateColumn = (board: Board, columnId: string, updates: Partial<Column>): Board => {
  const newBoard: Board = {
    ...board,
    columns: board.columns.map((col) => (col.id === columnId ? { ...col, ...updates } : col)),
  };

  saveBoard(newBoard);
  return newBoard;
};

export const deleteColumn = (board: Board, columnId: string): Board => {
  const column = board.columns.find((col) => col.id === columnId);
  if (!column) return board;

  // Delete all cards in the column
  const remainingCards = { ...board.cards };
  column.cardIds.forEach((cardId) => {
    delete remainingCards[cardId];
  });

  const newBoard: Board = {
    cards: remainingCards,
    columns: board.columns.filter((col) => col.id !== columnId),
  };

  saveBoard(newBoard);
  return newBoard;
};

export const moveCard = (
  board: Board,
  cardId: string,
  sourceColumnId: string,
  destinationColumnId: string,
  destinationIndex: number
): Board => {
  const newColumns = board.columns.map((col) => {
    if (col.id === sourceColumnId) {
      return {
        ...col,
        cardIds: col.cardIds.filter((id) => id !== cardId),
      };
    }
    if (col.id === destinationColumnId) {
      const newCardIds = [...col.cardIds];
      newCardIds.splice(destinationIndex, 0, cardId);
      return {
        ...col,
        cardIds: newCardIds,
      };
    }
    return col;
  });

  const newBoard: Board = {
    ...board,
    columns: newColumns,
  };

  saveBoard(newBoard);
  return newBoard;
};

export const reorderCard = (
  board: Board,
  columnId: string,
  startIndex: number,
  endIndex: number
): Board => {
  const column = board.columns.find((col) => col.id === columnId);
  if (!column) return board;

  const newCardIds = [...column.cardIds];
  const [removed] = newCardIds.splice(startIndex, 1);
  newCardIds.splice(endIndex, 0, removed);

  const newBoard: Board = {
    ...board,
    columns: board.columns.map((col) =>
      col.id === columnId ? { ...col, cardIds: newCardIds } : col
    ),
  };

  saveBoard(newBoard);
  return newBoard;
};
