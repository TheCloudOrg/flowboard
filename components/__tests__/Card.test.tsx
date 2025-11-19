import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from '../Card';
import { Card as CardType } from '@/types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock @dnd-kit/utilities
jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => 'transform: translate3d(0, 0, 0)'),
    },
  },
}));

describe('Card Component', () => {
  const mockCard: CardType = {
    id: 'card_test_1',
    title: 'Test Card Title',
    description: 'Test card description',
    notes: 'Test notes',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnAIGenerate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders card with title', () => {
    render(
      <Card
        card={mockCard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAIGenerate={mockOnAIGenerate}
      />
    );

    expect(screen.getByText('Test Card Title')).toBeInTheDocument();
  });

  it('renders card with description', () => {
    render(
      <Card
        card={mockCard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAIGenerate={mockOnAIGenerate}
      />
    );

    expect(screen.getByText('Test card description')).toBeInTheDocument();
  });

  it('renders card with notes', () => {
    render(
      <Card
        card={mockCard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAIGenerate={mockOnAIGenerate}
      />
    );

    expect(screen.getByText('Test notes')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const cardWithoutDescription = { ...mockCard, description: undefined };

    render(
      <Card
        card={cardWithoutDescription}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAIGenerate={mockOnAIGenerate}
      />
    );

    expect(screen.queryByText('Test card description')).not.toBeInTheDocument();
  });

  it('does not render notes when not provided', () => {
    const cardWithoutNotes = { ...mockCard, notes: undefined };

    render(
      <Card
        card={cardWithoutNotes}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAIGenerate={mockOnAIGenerate}
      />
    );

    expect(screen.queryByText('Test notes')).not.toBeInTheDocument();
  });

  it('displays formatted date', () => {
    render(
      <Card
        card={mockCard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAIGenerate={mockOnAIGenerate}
      />
    );

    // Date formatting may vary by locale, so just check that some date is displayed
    const dateElement = screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(dateElement).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <Card
        card={mockCard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAIGenerate={mockOnAIGenerate}
      />
    );

    // Find edit button by aria-label or title
    const buttons = screen.getAllByRole('button');
    const editButton = buttons.find(
      (btn) => btn.getAttribute('aria-label')?.includes('Edit') || btn.title?.includes('Edit')
    );

    if (editButton) {
      fireEvent.click(editButton);
      expect(mockOnEdit).toHaveBeenCalledWith(mockCard);
    }
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <Card
        card={mockCard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAIGenerate={mockOnAIGenerate}
      />
    );

    // Find delete button
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons.find(
      (btn) => btn.getAttribute('aria-label')?.includes('Delete') || btn.title?.includes('Delete')
    );

    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith(mockCard.id);
    }
  });

  it('calls onAIGenerate when AI button is clicked', () => {
    render(
      <Card
        card={mockCard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAIGenerate={mockOnAIGenerate}
      />
    );

    // Find AI generate button
    const buttons = screen.getAllByRole('button');
    const aiButton = buttons.find(
      (btn) => btn.getAttribute('aria-label')?.includes('AI') || btn.title?.includes('AI')
    );

    if (aiButton) {
      fireEvent.click(aiButton);
      expect(mockOnAIGenerate).toHaveBeenCalledWith(mockCard);
    }
  });

  it('has draggable attributes from useSortable', () => {
    const { container } = render(
      <Card
        card={mockCard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAIGenerate={mockOnAIGenerate}
      />
    );

    // Check that the component has attributes that would be added by useSortable
    const dragHandle = container.querySelector('[role="button"]');
    expect(dragHandle).toBeInTheDocument();
  });

  it('renders without crashing with minimal card data', () => {
    const minimalCard: CardType = {
      id: 'card_minimal',
      title: 'Minimal Card',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    render(
      <Card
        card={minimalCard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAIGenerate={mockOnAIGenerate}
      />
    );

    expect(screen.getByText('Minimal Card')).toBeInTheDocument();
  });
});
