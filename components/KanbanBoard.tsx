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
import { Plus, Sparkles, Loader2 } from 'lucide-react';
import { UserButton, useOrganization, useUser, OrganizationSwitcher } from '@clerk/nextjs';
import { Board, Card as CardType, Column as ColumnType } from '@/types';
import { getBoard } from '@/lib/localStorage';
import {
  getBoardAction,
  getBoardIdAction,
  initializeBoardAction,
  addCardAction,
  updateCardAction,
  deleteCardAction,
  addColumnAction,
  deleteColumnAction,
  moveCardAction,
} from '@/app/actions/board-actions';
import Column from './Column';
import Card from './Card';
import CardModal from './CardModal';
import AIPromptModal from './AIPromptModal';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

export default function KanbanBoard() {
  const { organization } = useOrganization();
  const { user } = useUser();
  const { theme } = useTheme();

  const [board, setBoard] = useState<Board>({ columns: [], cards: {} });
  const [boardId, setBoardId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [draggedCardOriginalColumn, setDraggedCardOriginalColumn] = useState<string | null>(null);
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

  // Track intended drop position for database update
  const [intendedDropPosition, setIntendedDropPosition] = useState<{ columnId: string; position: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Initialize board (migrate from localStorage if needed)
  useEffect(() => {
    async function initializeBoard() {
      if (!organization || !user) return;

      setIsLoading(true);

      try {
        // Check if board already exists
        const existingBoardId = await getBoardIdAction(organization.id);

        if (existingBoardId) {
          // Board already exists - just fetch it
          setBoardId(existingBoardId);

          const existingBoard = await getBoardAction(organization.id);
          if (existingBoard) {
            setBoard(existingBoard);
          }
        } else {
          // No board in Supabase - check localStorage for migration
          const localStorageData = getBoard();

          const result = await initializeBoardAction(
            organization.id,
            localStorageData
          );

          if (result.success && result.boardId) {
            setBoardId(result.boardId);

            // Fetch the newly created board
            const newBoard = await getBoardAction(organization.id);
            if (newBoard) {
              setBoard(newBoard);
            }

            console.log('✅ Board initialized:', result.boardId);
          } else {
            console.error('Failed to initialize board:', result.error);
          }
        }
      } catch (error) {
        console.error('Error initializing board:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeBoard();
  }, [organization, user]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = board.cards[active.id as string];
    if (card) {
      setActiveCard(card);
      // Store which column the card originally came from
      const originalColumn = board.columns.find((col) =>
        col.cardIds.includes(active.id as string)
      );
      setDraggedCardOriginalColumn(originalColumn?.id || null);
      console.log('🎬 Drag started from column:', originalColumn?.title);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and destination columns
    const activeColumn = board.columns.find((col) =>
      col.cardIds.includes(activeId)
    );

    const overColumn = board.columns.find(
      (col) => col.id === overId || col.cardIds.includes(overId)
    );

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return; // Skip if same column

    // Calculate the intended position BEFORE optimistic update
    const overIndex = overColumn.cardIds.includes(overId)
      ? overColumn.cardIds.indexOf(overId)
      : overColumn.cardIds.length;

    // Save intended drop position for handleDragEnd
    setIntendedDropPosition({ columnId: overColumn.id, position: overIndex });

    // Optimistic update for smooth UX
    setBoard((prevBoard) => {
      const newColumns = prevBoard.columns.map((col) => {
        // Remove card from source column
        if (col.id === activeColumn.id) {
          return {
            ...col,
            cardIds: col.cardIds.filter((id) => id !== activeId),
          };
        }
        // Add card to destination column
        if (col.id === overColumn.id) {
          const newCardIds = [...col.cardIds];
          newCardIds.splice(overIndex, 0, activeId);
          return { ...col, cardIds: newCardIds };
        }
        return col;
      });

      return { ...prevBoard, columns: newColumns };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) {
      setDraggedCardOriginalColumn(null);
      setIntendedDropPosition(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    console.log('🎯 handleDragEnd:', { activeId, overId });

    // Use the ORIGINAL column we saved at drag start (not current board state)
    const activeColumn = board.columns.find((col) => col.id === draggedCardOriginalColumn);

    const overColumn = board.columns.find(
      (col) => col.id === overId || col.cardIds.includes(overId)
    );

    if (!activeColumn || !overColumn) {
      console.log('❌ Column not found');
      setDraggedCardOriginalColumn(null);
      setIntendedDropPosition(null);
      return;
    }

    // Determine the target position
    let overIndex: number;

    if (intendedDropPosition && intendedDropPosition.columnId === overColumn.id) {
      // Use the pre-calculated position from handleDragOver (for cross-column moves)
      overIndex = intendedDropPosition.position;
      console.log('📍 Using intended drop position:', overIndex);
    } else {
      // Calculate position normally (for same-column moves or direct drops)
      overIndex = overColumn.cardIds.includes(overId)
        ? overColumn.cardIds.indexOf(overId)
        : overColumn.cardIds.length;
      console.log('📍 Calculated position:', overIndex);
    }

    console.log('📊 Positions:', {
      activeColumn: activeColumn.title,
      overColumn: overColumn.title,
      overIndex,
      originalColumnId: draggedCardOriginalColumn,
    });

    // Only update if position actually changed
    if (activeColumn.id === overColumn.id) {
      // Same column - check if position changed
      // Need to find original position from database state
      console.log('⏭️  Same column move - will let database handle position check');
    }

    console.log('🚀 Calling moveCardAction...');

    // Persist to Supabase
    const success = await moveCardAction(activeId, overColumn.id, overIndex);

    console.log('✅ moveCardAction result:', success);

    if (success && organization) {
      // Refresh board from Supabase
      console.log('🔄 Refreshing board from Supabase...');
      const updatedBoard = await getBoardAction(organization.id);
      if (updatedBoard) {
        setBoard(updatedBoard);
        console.log('✅ Board refreshed');
      }
    }

    // Clear the tracked state
    setDraggedCardOriginalColumn(null);
    setIntendedDropPosition(null);
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

  const handleSaveCard = async (cardData: Partial<CardType>) => {
    if (!boardId || !organization) return;

    if (editingCard) {
      // Update existing card
      const success = await updateCardAction(editingCard.id, cardData);
      if (success) {
        const updatedBoard = await getBoardAction(organization.id);
        if (updatedBoard) {
          setBoard(updatedBoard);
        }
      }
    } else {
      // Add new card
      const newCard = await addCardAction(boardId, currentColumnId, {
        title: cardData.title || '',
        description: cardData.description,
        notes: cardData.notes,
      });

      if (newCard) {
        const updatedBoard = await getBoardAction(organization.id);
        if (updatedBoard) {
          setBoard(updatedBoard);
        }
      }
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!organization) return;

    if (confirm('Are you sure you want to delete this card?')) {
      const success = await deleteCardAction(cardId);
      if (success) {
        const updatedBoard = await getBoardAction(organization.id);
        if (updatedBoard) {
          setBoard(updatedBoard);
        }
      }
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!organization) return;

    if (confirm('Are you sure you want to delete this column and all its cards?')) {
      const success = await deleteColumnAction(columnId);
      if (success) {
        const updatedBoard = await getBoardAction(organization.id);
        if (updatedBoard) {
          setBoard(updatedBoard);
        }
      }
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim() || !boardId || !organization) return;

    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newColumn = await addColumnAction(boardId, newColumnName.trim(), randomColor);
    if (newColumn) {
      const updatedBoard = await getBoardAction(organization.id);
      if (updatedBoard) {
        setBoard(updatedBoard);
      }
      setNewColumnName('');
      setShowColumnInput(false);
    }
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

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your board...</p>
        </div>
      </div>
    );
  }

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
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Flow Board
              </h1>
              {organization && (
                <p className="ml-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {organization.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <OrganizationSwitcher
              appearance={{
                baseTheme: theme === 'dark' ? undefined : undefined,
                variables: {
                  colorText: theme === 'dark' ? 'white' : 'rgb(17, 24, 39)',
                  colorTextSecondary: theme === 'dark' ? 'rgb(209, 213, 219)' : 'rgb(75, 85, 99)',
                  colorTextOnPrimaryBackground: theme === 'dark' ? 'white' : 'rgb(17, 24, 39)',
                  colorBackground: theme === 'dark' ? 'rgb(31, 41, 55)' : 'rgba(255, 255, 255, 0.95)',
                  colorInputBackground: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'white',
                  colorInputText: theme === 'dark' ? 'white' : 'rgb(17, 24, 39)',
                  colorPrimary: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
                  colorDanger: theme === 'dark' ? '#ef4444' : '#dc2626',
                  colorSuccess: theme === 'dark' ? '#10b981' : '#059669',
                  colorWarning: theme === 'dark' ? '#f59e0b' : '#d97706',
                  colorNeutral: theme === 'dark' ? 'white' : 'rgb(17, 24, 39)',
                  fontSize: '0.875rem',
                },
                elements: {
                  rootBox: "flex items-center",
                  organizationSwitcherTrigger: "glass-effect px-4 py-2 rounded-xl border border-gray-300 dark:border-white/10 hover:border-primary-400/50 transition-all",
                  organizationSwitcherTriggerIcon: "text-primary-400",
                  organizationSwitcherPopoverCard: "glass-effect border border-gray-300 dark:border-white/10",
                  organizationSwitcherPopoverActionButton: theme === 'dark' ? "bg-gray-800 hover:bg-white/10" : "bg-white hover:bg-gray-100",
                  organizationPreviewMainIdentifier: theme === 'dark' ? "text-white" : "text-gray-900",
                  organizationPreviewSecondaryIdentifier: theme === 'dark' ? "text-gray-400" : "text-gray-600",
                }
              }}
            />
            <UserButton
              appearance={{
                variables: {
                  colorText: theme === 'dark' ? 'white' : 'rgb(17, 24, 39)',
                  colorTextSecondary: theme === 'dark' ? 'rgb(209, 213, 219)' : 'rgb(75, 85, 99)',
                  colorTextOnPrimaryBackground: theme === 'dark' ? 'white' : 'rgb(17, 24, 39)',
                  colorBackground: theme === 'dark' ? 'rgb(31, 41, 55)' : 'rgba(255, 255, 255, 0.95)',
                  colorInputBackground: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'white',
                  colorInputText: theme === 'dark' ? 'white' : 'rgb(17, 24, 39)',
                  colorPrimary: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
                  colorDanger: theme === 'dark' ? '#ef4444' : '#dc2626',
                  colorSuccess: theme === 'dark' ? '#10b981' : '#059669',
                  colorWarning: theme === 'dark' ? '#f59e0b' : '#d97706',
                  colorNeutral: theme === 'dark' ? 'white' : 'rgb(17, 24, 39)',
                  fontSize: '0.875rem',
                },
                elements: {
                  avatarBox: "w-10 h-10 ring-2 ring-primary-400/30 hover:ring-primary-400/50 transition-all",
                  userButtonPopoverCard: "glass-effect border border-gray-300 dark:border-white/10",
                  userButtonPopoverActionButton: theme === 'dark' ? "bg-gray-800 hover:bg-white/10" : "bg-white hover:bg-gray-100",
                }
              }}
            />
            <ThemeToggle />
          </div>
        </div>
        <p className="ml-11 text-gray-600 dark:text-gray-400">
          Organize and flow through your tasks with beautiful drag-and-drop boards
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
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
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
                    className="flex-1 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-900 dark:text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowColumnInput(true)}
                className="w-full h-full min-h-[120px] glass-effect rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-primary-400/50 hover:bg-primary-500/10 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-300 transition-all duration-200 flex flex-col items-center justify-center gap-3 group"
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
