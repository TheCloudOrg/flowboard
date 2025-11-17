export interface Card {
  id: string;
  title: string;
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
  color?: string;
}

export interface Board {
  columns: Column[];
  cards: { [key: string]: Card };
}

export type CardMap = { [key: string]: Card };
