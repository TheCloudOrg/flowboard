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
import { Plus, Sparkles, Loader2, ChevronDown, LayoutGrid } from 'lucide-react';
import { UserButton, useOrganization, useUser, OrganizationSwitcher } from '@clerk/nextjs';
import { Board, Card as CardType, Column as ColumnType } from '@/types';
import { getBoard } from '@/lib/localStorage';
import {
  getBoardAction,
  getBoardIdAction,
  getBoardByIdAction,
  getAllBoardsAction,
  initializeBoardAction,
  createBoardAction,
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
import CreateBoardModal from './CreateBoardModal';
import ThemeToggle from './ThemeToggle';
import UsageStats from './UsageStats';
import { useTheme } from '@/contexts/ThemeContext';

export default function KanbanBoard() {
  const { organization } = useOrganization();
  const { user } = useUser();
  const { theme } = useTheme();

  const [board, setBoard] = useState<Board>({ columns: [], cards: {} });
  const [boardId, setBoardId] = useState<string>('');
  const [boards, setBoards] = useState<{ id: string; name: string; created_at: string }[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [selectedBoardName, setSelectedBoardName] = useState<string>('My Board');
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
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
  const [aiUpgradeRequired, setAiUpgradeRequired] = useState(false);
  const [currentAICard, setCurrentAICard] = useState<CardType | null>(null);

  // Track intended drop position for database update
  const [intendedDropPosition, setIntendedDropPosition] = useState<{
    columnId: string;
    position: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch all boards for organization and load the selected one
  useEffect(() => {
    async function fetchAndLoadBoards() {
      if (!organization || !user) return;

      setIsLoading(true);

      try {
        const allBoards = await getAllBoardsAction(organization.id);
        setBoards(allBoards);

        // If no boards exist, initialize one
        if (allBoards.length === 0) {
          const localStorageData = getBoard();
          const result = await initializeBoardAction(organization.id, localStorageData);

          if (result.success && result.boardId) {
            // Refresh boards list and load the new board
            const updatedBoards = await getAllBoardsAction(organization.id);
            setBoards(updatedBoards);
            setSelectedBoardId(result.boardId);
            setSelectedBoardName(updatedBoards[0]?.name || 'My Board');
            sessionStorage.setItem(`selectedBoardId_${organization.id}`, result.boardId);

            // Load the board data immediately
            const boardData = await getBoardByIdAction(result.boardId);
            if (boardData) {
              setBoard(boardData);
              setBoardId(result.boardId);
            }
          }
        } else {
          // Determine which board to load
          const savedBoardId = sessionStorage.getItem(`selectedBoardId_${organization.id}`);
          const savedBoard = savedBoardId ? allBoards.find((b) => b.id === savedBoardId) : null;

          const boardToLoad = savedBoard || allBoards[0];

          // Set the selected board
          setSelectedBoardId(boardToLoad.id);
          setSelectedBoardName(boardToLoad.name);

          if (!savedBoard) {
            sessionStorage.setItem(`selectedBoardId_${organization.id}`, allBoards[0].id);
          }

          // Load board data immediately (no waiting for second useEffect)
          const boardData = await getBoardByIdAction(boardToLoad.id);
          if (boardData) {
            setBoard(boardData);
            setBoardId(boardToLoad.id);
          }
        }
      } catch (error) {
        console.error('Error fetching boards:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAndLoadBoards();
  }, [organization, user]);

  // Refresh current board data
  const refreshCurrentBoard = async () => {
    if (!selectedBoardId) return;

    try {
      const boardData = await getBoardByIdAction(selectedBoardId);
      if (boardData) {
        setBoard(boardData);
        setBoardId(selectedBoardId);
      }
    } catch (error) {
      console.error('Error refreshing board:', error);
    }
  };

  // Load board data when user manually switches boards
  useEffect(() => {
    async function loadBoard() {
      // Skip if this is the initial load (handled by fetchAndLoadBoards)
      // or if board is already loaded
      if (!selectedBoardId || boardId === selectedBoardId) return;

      setIsLoading(true);

      try {
        const boardData = await getBoardByIdAction(selectedBoardId);
        if (boardData) {
          setBoard(boardData);
          setBoardId(selectedBoardId);
        }
      } catch (error) {
        console.error('Error loading board:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBoard();
  }, [selectedBoardId]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = board.cards[active.id as string];
    if (card) {
      setActiveCard(card);
      // Store which column the card originally came from
      const originalColumn = board.columns.find((col) => col.cardIds.includes(active.id as string));
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
    const activeColumn = board.columns.find((col) => col.cardIds.includes(activeId));

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

    if (success) {
      // Refresh board from Supabase
      console.log('🔄 Refreshing board from Supabase...');
      await refreshCurrentBoard();
      console.log('✅ Board refreshed');
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
        await refreshCurrentBoard();
      }
    } else {
      // Add new card
      const newCard = await addCardAction(boardId, currentColumnId, {
        title: cardData.title || '',
        description: cardData.description,
        notes: cardData.notes,
      });

      if (newCard) {
        await refreshCurrentBoard();
      }
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!organization) return;

    if (confirm('Are you sure you want to delete this card?')) {
      const success = await deleteCardAction(cardId);
      if (success) {
        await refreshCurrentBoard();
      }
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!organization) return;

    if (confirm('Are you sure you want to delete this column and all its cards?')) {
      const success = await deleteColumnAction(columnId);
      if (success) {
        await refreshCurrentBoard();
      }
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim() || !boardId || !organization) return;

    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newColumn = await addColumnAction(boardId, newColumnName.trim(), randomColor);
    if (newColumn) {
      await refreshCurrentBoard();
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
    setAiUpgradeRequired(false);

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
        // Check if this is a limit error (429 status)
        if (response.status === 429 && data.upgrade_required) {
          setAiUpgradeRequired(true);
        }
        throw new Error(data.error || 'Failed to generate prompt');
      }

      setAiPrompt(data.prompt);

      // Trigger usage stats refresh
      window.dispatchEvent(new Event('usage-updated'));
    } catch (error: any) {
      console.error('Error generating AI prompt:', error);
      setAiError(error.message || 'Failed to generate prompt. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleCreateBoard = async (name: string) => {
    if (!organization) return;

    const result = await createBoardAction(organization.id, name);

    if (result.success && result.boardId) {
      // Refresh boards list
      const updatedBoards = await getAllBoardsAction(organization.id);
      setBoards(updatedBoards);

      // Switch to the new board
      setSelectedBoardId(result.boardId);
      setSelectedBoardName(name);

      // Save to sessionStorage
      sessionStorage.setItem(`selectedBoardId_${organization.id}`, result.boardId);

      // Trigger usage stats refresh
      window.dispatchEvent(new Event('usage-updated'));
    } else {
      throw new Error(result.error || 'Failed to create board');
    }
  };

  const handleSelectBoard = (boardId: string, boardName: string) => {
    setSelectedBoardId(boardId);
    setSelectedBoardName(boardName);
    setShowBoardDropdown(false);

    // Save to sessionStorage
    if (organization) {
      sessionStorage.setItem(`selectedBoardId_${organization.id}`, boardId);
    }
  };

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="dark:text-gray-400 light:text-gray-600">Loading your board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Sparkles className="w-8 h-8 text-primary-400" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Flow Board
              </h1>
              {organization && (
                <p className="ml-1 mt-1 text-sm dark:text-gray-400 light:text-gray-600">
                  {organization.name}
                </p>
              )}
            </div>

            {/* Board Selector */}
            <div className="relative">
              <button
                onClick={() => setShowBoardDropdown(!showBoardDropdown)}
                className="flex items-center gap-2 px-4 py-2 glass-effect rounded-xl border dark:border-white/10 light:border-gray-300 hover:border-primary-400/50 transition-all"
              >
                <LayoutGrid className="w-4 h-4 text-primary-400" />
                <span className="font-medium dark:text-white light:text-gray-900">
                  {selectedBoardName}
                </span>
                <ChevronDown
                  className={`w-4 h-4 dark:text-gray-400 light:text-gray-600 transition-transform ${
                    showBoardDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown */}
              {showBoardDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 mt-2 w-64 glass-effect rounded-2xl border dark:border-white/10 light:border-gray-300 shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-2">
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {boards.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => handleSelectBoard(b.id, b.name)}
                          className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                            b.id === selectedBoardId
                              ? 'bg-primary-500/20 dark:text-white light:text-gray-900'
                              : 'dark:hover:bg-white/5 light:hover:bg-gray-100 dark:text-gray-300 light:text-gray-700'
                          }`}
                        >
                          <div className="font-medium">{b.name}</div>
                          <div className="text-xs dark:text-gray-500 light:text-gray-600 mt-1">
                            {new Date(b.created_at).toLocaleDateString()}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Create Board Button */}
                    <div className="border-t dark:border-white/10 light:border-gray-300 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setShowBoardDropdown(false);
                          setIsCreateBoardOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-xl dark:hover:bg-white/5 light:hover:bg-gray-100 dark:text-primary-300 light:text-primary-600 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="font-medium">Create New Board</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
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
                  colorBackground:
                    theme === 'dark' ? 'rgb(31, 41, 55)' : 'rgba(255, 255, 255, 0.95)',
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
                  rootBox: 'flex items-center',
                  organizationSwitcherTrigger:
                    'glass-effect px-4 py-2 rounded-xl border dark:border-white/10 light:border-gray-300 hover:border-primary-400/50 transition-all',
                  organizationSwitcherTriggerIcon: 'text-primary-400',
                  organizationSwitcherPopoverCard:
                    'glass-effect border dark:border-white/10 light:border-gray-300',
                  organizationSwitcherPopoverActionButton:
                    theme === 'dark'
                      ? 'bg-gray-800 hover:bg-white/10'
                      : 'bg-white hover:bg-gray-100',
                  organizationPreviewMainIdentifier:
                    theme === 'dark' ? 'text-white' : 'text-gray-900',
                  organizationPreviewSecondaryIdentifier:
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
                },
              }}
            />
            <UserButton
              appearance={{
                variables: {
                  colorText: theme === 'dark' ? 'white' : 'rgb(17, 24, 39)',
                  colorTextSecondary: theme === 'dark' ? 'rgb(209, 213, 219)' : 'rgb(75, 85, 99)',
                  colorTextOnPrimaryBackground: theme === 'dark' ? 'white' : 'rgb(17, 24, 39)',
                  colorBackground:
                    theme === 'dark' ? 'rgb(31, 41, 55)' : 'rgba(255, 255, 255, 0.95)',
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
                  avatarBox:
                    'w-10 h-10 ring-2 ring-primary-400/30 hover:ring-primary-400/50 transition-all',
                  userButtonPopoverCard:
                    'glass-effect border dark:border-white/10 light:border-gray-300',
                  userButtonPopoverActionButton:
                    theme === 'dark'
                      ? 'bg-gray-800 hover:bg-white/10'
                      : 'bg-white hover:bg-gray-100',
                },
              }}
            />
            <ThemeToggle />
          </div>
        </div>
        <p className="ml-11 dark:text-gray-400 light:text-gray-600">
          Organize and flow through your tasks with beautiful drag-and-drop boards
        </p>
      </motion.div>

      {/* Usage Stats */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <UsageStats />
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
            const columnCards = column.cardIds.map((id) => board.cards[id]).filter(Boolean);

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
          setAiUpgradeRequired(false);
          setCurrentAICard(null);
        }}
        prompt={aiPrompt}
        isLoading={isLoadingAI}
        error={aiError}
        upgradeRequired={aiUpgradeRequired}
        cardTitle={currentAICard?.title || ''}
      />

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={isCreateBoardOpen}
        onClose={() => setIsCreateBoardOpen(false)}
        onCreateBoard={handleCreateBoard}
      />
    </div>
  );
}
