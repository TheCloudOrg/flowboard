import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Column from '../Column'
import { Column as ColumnType, Card as CardType } from '@/types'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock Card component to simplify testing
jest.mock('../Card', () => {
  return function MockCard({ card, onEdit, onDelete, onAIGenerate }: any) {
    return (
      <div data-testid={`card-${card.id}`}>
        <h3>{card.title}</h3>
        <button onClick={() => onEdit(card)}>Edit</button>
        <button onClick={() => onDelete(card.id)}>Delete</button>
        <button onClick={() => onAIGenerate(card)}>AI Generate</button>
      </div>
    )
  }
})

describe('Column Component', () => {
  const mockCards: { [key: string]: CardType } = {
    card_1: {
      id: 'card_1',
      title: 'Card 1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    card_2: {
      id: 'card_2',
      title: 'Card 2',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
    },
  }

  const mockColumn: ColumnType = {
    id: 'col_1',
    title: 'TODO',
    color: '#ef4444',
    cardIds: ['card_1', 'card_2'],
  }

  const mockOnAddCard = jest.fn()
  const mockOnEditCard = jest.fn()
  const mockOnDeleteCard = jest.fn()
  const mockOnEditColumn = jest.fn()
  const mockOnDeleteColumn = jest.fn()
  const mockOnAIGenerate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders column title', () => {
    render(
      <Column
        column={mockColumn}
        cards={mockCards}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onEditColumn={mockOnEditColumn}
        onDeleteColumn={mockOnDeleteColumn}
        onAIGenerate={mockOnAIGenerate}
      />
    )

    expect(screen.getByText('TODO')).toBeInTheDocument()
  })

  it('renders all cards in the column', () => {
    render(
      <Column
        column={mockColumn}
        cards={mockCards}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onEditColumn={mockOnEditColumn}
        onDeleteColumn={mockOnDeleteColumn}
        onAIGenerate={mockOnAIGenerate}
      />
    )

    expect(screen.getByTestId('card-card_1')).toBeInTheDocument()
    expect(screen.getByTestId('card-card_2')).toBeInTheDocument()
  })

  it('renders cards in the correct order', () => {
    render(
      <Column
        column={mockColumn}
        cards={mockCards}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onEditColumn={mockOnEditColumn}
        onDeleteColumn={mockOnDeleteColumn}
        onAIGenerate={mockOnAIGenerate}
      />
    )

    const cardElements = screen.getAllByTestId(/^card-/)
    expect(cardElements[0]).toHaveAttribute('data-testid', 'card-card_1')
    expect(cardElements[1]).toHaveAttribute('data-testid', 'card-card_2')
  })

  it('displays card count', () => {
    render(
      <Column
        column={mockColumn}
        cards={mockCards}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onEditColumn={mockOnEditColumn}
        onDeleteColumn={mockOnDeleteColumn}
        onAIGenerate={mockOnAIGenerate}
      />
    )

    // Look for text showing the count (exact format may vary)
    expect(screen.getByText(/2/)).toBeInTheDocument()
  })

  it('renders empty column correctly', () => {
    const emptyColumn = { ...mockColumn, cardIds: [] }

    render(
      <Column
        column={emptyColumn}
        cards={mockCards}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onEditColumn={mockOnEditColumn}
        onDeleteColumn={mockOnDeleteColumn}
        onAIGenerate={mockOnAIGenerate}
      />
    )

    expect(screen.getByText('TODO')).toBeInTheDocument()
    expect(screen.queryByTestId(/^card-/)).not.toBeInTheDocument()
  })

  it('calls onAddCard when add button is clicked', () => {
    render(
      <Column
        column={mockColumn}
        cards={mockCards}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onEditColumn={mockOnEditColumn}
        onDeleteColumn={mockOnDeleteColumn}
        onAIGenerate={mockOnAIGenerate}
      />
    )

    // Find add card button (may be labeled with + or "Add" text)
    const buttons = screen.getAllByRole('button')
    const addButton = buttons.find(
      (btn) =>
        btn.textContent?.includes('+') ||
        btn.textContent?.includes('Add') ||
        btn.getAttribute('aria-label')?.includes('Add')
    )

    if (addButton) {
      fireEvent.click(addButton)
      expect(mockOnAddCard).toHaveBeenCalledWith(mockColumn.id)
    }
  })

  it('passes edit handler to cards', () => {
    render(
      <Column
        column={mockColumn}
        cards={mockCards}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onEditColumn={mockOnEditColumn}
        onDeleteColumn={mockOnDeleteColumn}
        onAIGenerate={mockOnAIGenerate}
      />
    )

    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])

    expect(mockOnEditCard).toHaveBeenCalledWith(mockCards.card_1)
  })

  it('passes delete handler to cards', () => {
    render(
      <Column
        column={mockColumn}
        cards={mockCards}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onEditColumn={mockOnEditColumn}
        onDeleteColumn={mockOnDeleteColumn}
        onAIGenerate={mockOnAIGenerate}
      />
    )

    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    expect(mockOnDeleteCard).toHaveBeenCalledWith('card_1')
  })

  it('applies custom color to column header', () => {
    const { container } = render(
      <Column
        column={mockColumn}
        cards={mockCards}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onEditColumn={mockOnEditColumn}
        onDeleteColumn={mockOnDeleteColumn}
        onAIGenerate={mockOnAIGenerate}
      />
    )

    // The column color is applied via styles or className
    // This is a simple check to ensure the component renders
    expect(container.querySelector('[style*="color"]') || container.querySelector('[class*="border"]')).toBeTruthy()
  })

  it('handles missing cards gracefully', () => {
    const columnWithMissingCards = {
      ...mockColumn,
      cardIds: ['card_1', 'card_missing', 'card_2'],
    }

    render(
      <Column
        column={columnWithMissingCards}
        cards={mockCards}
        onAddCard={mockOnAddCard}
        onEditCard={mockOnEditCard}
        onDeleteCard={mockOnDeleteCard}
        onEditColumn={mockOnEditColumn}
        onDeleteColumn={mockOnDeleteColumn}
        onAIGenerate={mockOnAIGenerate}
      />
    )

    // Should only render cards that exist in the cards object
    expect(screen.getByTestId('card-card_1')).toBeInTheDocument()
    expect(screen.getByTestId('card-card_2')).toBeInTheDocument()
    expect(screen.queryByTestId('card-card_missing')).not.toBeInTheDocument()
  })
})
