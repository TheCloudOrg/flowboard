/**
 * Input Validation Utilities
 *
 * Provides validation functions and limits for user inputs
 * to prevent database bloat, DoS attacks, and ensure data quality.
 */

// Validation limits
export const VALIDATION_LIMITS = {
  // Card validation
  CARD_TITLE: 200,
  CARD_DESCRIPTION: 2000,
  CARD_NOTES: 5000,

  // Board validation
  BOARD_NAME: 100,
  BOARD_DESCRIPTION: 500,

  // Column validation
  COLUMN_TITLE: 100,

  // Organization validation
  ORG_NAME: 100,

  // User validation
  USER_NAME: 100,

  // Limits
  MAX_CARDS_PER_COLUMN: 100,
  MAX_COLUMNS_PER_BOARD: 20,
} as const;

// Validation result type
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate card input
 */
export function validateCardInput(card: {
  title?: string;
  description?: string | null;
  notes?: string | null;
}): ValidationResult {
  // Title is required
  if (!card.title || card.title.trim().length === 0) {
    return { valid: false, error: 'Card title is required' };
  }

  // Title length check
  if (card.title.length > VALIDATION_LIMITS.CARD_TITLE) {
    return {
      valid: false,
      error: `Card title must be ${VALIDATION_LIMITS.CARD_TITLE} characters or less`,
    };
  }

  // Description length check
  if (card.description && card.description.length > VALIDATION_LIMITS.CARD_DESCRIPTION) {
    return {
      valid: false,
      error: `Description must be ${VALIDATION_LIMITS.CARD_DESCRIPTION} characters or less`,
    };
  }

  // Notes length check
  if (card.notes && card.notes.length > VALIDATION_LIMITS.CARD_NOTES) {
    return {
      valid: false,
      error: `Notes must be ${VALIDATION_LIMITS.CARD_NOTES} characters or less`,
    };
  }

  return { valid: true };
}

/**
 * Validate board input
 */
export function validateBoardInput(board: {
  name?: string;
  description?: string | null;
}): ValidationResult {
  // Name is required
  if (!board.name || board.name.trim().length === 0) {
    return { valid: false, error: 'Board name is required' };
  }

  // Name length check
  if (board.name.length > VALIDATION_LIMITS.BOARD_NAME) {
    return {
      valid: false,
      error: `Board name must be ${VALIDATION_LIMITS.BOARD_NAME} characters or less`,
    };
  }

  // Description length check
  if (board.description && board.description.length > VALIDATION_LIMITS.BOARD_DESCRIPTION) {
    return {
      valid: false,
      error: `Description must be ${VALIDATION_LIMITS.BOARD_DESCRIPTION} characters or less`,
    };
  }

  return { valid: true };
}

/**
 * Validate column input
 */
export function validateColumnInput(column: {
  title?: string;
}): ValidationResult {
  // Title is required
  if (!column.title || column.title.trim().length === 0) {
    return { valid: false, error: 'Column title is required' };
  }

  // Title length check
  if (column.title.length > VALIDATION_LIMITS.COLUMN_TITLE) {
    return {
      valid: false,
      error: `Column title must be ${VALIDATION_LIMITS.COLUMN_TITLE} characters or less`,
    };
  }

  return { valid: true };
}

/**
 * Validate organization input
 */
export function validateOrganizationInput(org: {
  name?: string;
}): ValidationResult {
  // Name is required
  if (!org.name || org.name.trim().length === 0) {
    return { valid: false, error: 'Organization name is required' };
  }

  // Name length check
  if (org.name.length > VALIDATION_LIMITS.ORG_NAME) {
    return {
      valid: false,
      error: `Organization name must be ${VALIDATION_LIMITS.ORG_NAME} characters or less`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize string input
 * Trims whitespace and removes potentially dangerous characters
 */
export function sanitizeString(input: string | null | undefined): string | null {
  if (!input) return null;

  return input.trim() || null;
}

/**
 * Validate and sanitize card input
 * Returns sanitized card or throws error
 */
export function validateAndSanitizeCard(card: {
  title: string;
  description?: string | null;
  notes?: string | null;
}): {
  title: string;
  description?: string;
  notes?: string;
} {
  const validation = validateCardInput(card);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const sanitized = sanitizeString(card.description);
  const sanitizedNotes = sanitizeString(card.notes);

  return {
    title: sanitizeString(card.title)!,
    ...(sanitized && { description: sanitized }),
    ...(sanitizedNotes && { notes: sanitizedNotes }),
  };
}

/**
 * Validate and sanitize board input
 * Returns sanitized board or throws error
 */
export function validateAndSanitizeBoard(board: {
  name: string;
  description?: string | null;
}): {
  name: string;
  description: string | null;
} {
  const validation = validateBoardInput(board);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return {
    name: sanitizeString(board.name)!,
    description: sanitizeString(board.description),
  };
}

/**
 * Validate and sanitize column input
 * Returns sanitized column or throws error
 */
export function validateAndSanitizeColumn(column: {
  title: string;
}): {
  title: string;
} {
  const validation = validateColumnInput(column);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return {
    title: sanitizeString(column.title)!,
  };
}
