'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { Board, Card as CardType, Column as ColumnType } from '@/types';
import {
  getBoard,
  addCard as addCardToStorage,
  updateCard,
  deleteCard,
  addColumn,
  deleteColumn,
  moveCard,
  reorderCard,
} from '@/lib/localStorage';
import Column from './Column';
import Card from './Card';
import CardModal from './CardModal';
import AIPromptModal from './AIPromptModal';
import ThemeToggle from './ThemeToggle';

export default function KanbanBoard() {
  const [board, setBoard] = useState<Board>({ columns: [], cards: {} });
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [currentColumnId, setCurrentColumnId] = useState<string>('');
  const [newColumnName, setNewColumnName] = useState('');
  const [showColumnInput, setShowColumnInput] = useState(false);

  // AI Prompt Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [currentAICard, setCurrentAICard] = useState<CardType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setBoard(getBoard());
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = board.cards[active.id as string];
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which column the active card is in
    const activeColumn = board.columns.find((col) =>
      col.cardIds.includes(activeId)
    );

    // Check if over is a column or a card
    const overColumn = board.columns.find(
      (col) => col.id === overId || col.cardIds.includes(overId)
    );

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return;

    // Move card to new column
    const activeIndex = activeColumn.cardIds.indexOf(activeId);
    const overIndex = overColumn.cardIds.includes(overId)
      ? overColumn.cardIds.indexOf(overId)
      : overColumn.cardIds.length;

    setBoard((prev) => {
      const newColumns = prev.columns.map((col) => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            cardIds: col.cardIds.filter((id) => id !== activeId),
          };
        }
        if (col.id === overColumn.id) {
          const newCardIds = [...col.cardIds];
          newCardIds.splice(overIndex, 0, activeId);
          return {
            ...col,
            cardIds: newCardIds,
          };
        }
        return col;
      });

      return {
        ...prev,
        columns: newColumns,
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find columns
    const activeColumn = board.columns.find((col) =>
      col.cardIds.includes(activeId)
    );

    const overColumn = board.columns.find(
      (col) => col.id === overId || col.cardIds.includes(overId)
    );

    if (!activeColumn || !overColumn) return;

    const activeIndex = activeColumn.cardIds.indexOf(activeId);
    const overIndex = overColumn.cardIds.includes(overId)
      ? overColumn.cardIds.indexOf(overId)
      : overColumn.cardIds.length;

    if (activeColumn.id === overColumn.id) {
      // Reordering within the same column
      if (activeIndex !== overIndex) {
        const newBoard = reorderCard(board, activeColumn.id, activeIndex, overIndex);
        setBoard(newBoard);
      }
    } else {
      // Moving to a different column
      const newBoard = moveCard(board, activeId, activeColumn.id, overColumn.id, overIndex);
      setBoard(newBoard);
    }
  };

  const handleAddCard = (columnId: string) => {
    setCurrentColumnId(columnId);
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handleEditCard = (card: CardType) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleSaveCard = (cardData: Partial<CardType>) => {
    if (editingCard) {
      // Update existing card
      const newBoard = updateCard(board, editingCard.id, cardData);
      setBoard(newBoard);
    } else {
      // Add new card
      const newBoard = addCardToStorage(board, currentColumnId, {
        title: cardData.title || '',
        description: cardData.description,
        notes: cardData.notes,
      });
      setBoard(newBoard);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      const newBoard = deleteCard(board, cardId);
      setBoard(newBoard);
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    if (confirm('Are you sure you want to delete this column and all its cards?')) {
      const newBoard = deleteColumn(board, columnId);
      setBoard(newBoard);
    }
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;

    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newBoard = addColumn(board, newColumnName.trim(), randomColor);
    setBoard(newBoard);
    setNewColumnName('');
    setShowColumnInput(false);
  };

  const handleAIGenerate = async (card: CardType) => {
    setCurrentAICard(card);
    setIsAIModalOpen(true);
    setIsLoadingAI(true);
    setAiError(null);
    setAiPrompt(null);

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: card.title,
          description: card.description,
          notes: card.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prompt');
      }

      setAiPrompt(data.prompt);
    } catch (error: any) {
      console.error('Error generating AI prompt:', error);
      setAiError(error.message || 'Failed to generate prompt. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Project Management
            </h1>
          </div>
          <ThemeToggle />
        </div>
        <p className="ml-11 dark:text-gray-400 light:text-gray-600">
          Organize your tasks with beautiful drag-and-drop Kanban boards
        </p>
      </motion.div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          {board.columns.map((column) => {
            const columnCards = column.cardIds
              .map((id) => board.cards[id])
              .filter(Boolean);

            return (
              <Column
                key={column.id}
                column={column}
                cards={columnCards}
                onAddCard={handleAddCard}
                onEditCard={handleEditCard}
                onDeleteCard={handleDeleteCard}
                onDeleteColumn={handleDeleteColumn}
                onAIGenerate={handleAIGenerate}
              />
            );
          })}

          {/* Add Column Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="min-w-[320px] max-w-[320px]"
          >
            {showColumnInput ? (
              <div className="glass-effect rounded-2xl p-4">
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn();
                    if (e.key === 'Escape') {
                      setShowColumnInput(false);
                      setNewColumnName('');
                    }
                  }}
                  placeholder="Column name..."
                  className="w-full px-4 py-2 dark:bg-white/5 light:bg-gray-50 border dark:border-white/10 light:border-gray-300 rounded-xl dark:text-white light:text-gray-900 dark:placeholder-gray-500 light:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddColumn}
                    className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-white font-medium transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowColumnInput(false);
                      setNewColumnName('');
                    }}
                    className="flex-1 px-4 py-2 dark:bg-white/5 light:bg-gray-100 dark:hover:bg-white/10 light:hover:bg-gray-200 rounded-lg dark:text-white light:text-gray-900 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowColumnInput(true)}
                className="w-full h-full min-h-[120px] glass-effect rounded-2xl border-2 border-dashed dark:border-white/20 light:border-gray-300 hover:border-primary-400/50 hover:bg-primary-500/10 dark:text-gray-400 light:text-gray-600 dark:hover:text-primary-300 light:hover:text-primary-600 transition-all duration-200 flex flex-col items-center justify-center gap-3 group"
              >
                <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-lg">Add Column</span>
              </button>
            )}
          </motion.div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard ? (
            <div className="opacity-80 rotate-3 scale-105">
              <Card
                card={activeCard}
                onEdit={() => {}}
                onDelete={() => {}}
                onAIGenerate={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Card Modal */}
      <CardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        card={editingCard}
        columnId={currentColumnId}
      />

      {/* AI Prompt Modal */}
      <AIPromptModal
        isOpen={isAIModalOpen}
        onClose={() => {
          setIsAIModalOpen(false);
          setAiPrompt(null);
          setAiError(null);
          setCurrentAICard(null);
        }}
        prompt={aiPrompt}
        isLoading={isLoadingAI}
        error={aiError}
        cardTitle={currentAICard?.title || ''}
      />
    </div>
  );
}
