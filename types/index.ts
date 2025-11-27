export interface Card {
  id: string;
  title: string;
  description?: string;
  techStack?: string;
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

export interface OnboardingStatus {
  id: string;
  user_id: string;
  completed: boolean;
  current_step: number;
  theme_preference: string | null;
  first_board_created: boolean;
  skipped: boolean;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
}

export interface OnboardingStepData {
  theme_preference?: string;
  first_board_created?: boolean;
  [key: string]: any;
}
