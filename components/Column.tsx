'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Plus, MoreVertical, Trash2 } from 'lucide-react';
import { Column as ColumnType, Card as CardType } from '@/types';
import Card from './Card';
import { useState } from 'react';

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  onAddCard: (columnId: string) => void;
  onEditCard: (card: CardType) => void;
  onDeleteCard: (cardId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onAIGenerate: (card: CardType) => void;
}

export default function Column({
  column,
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onDeleteColumn,
  onAIGenerate,
}: ColumnProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const cardIds = column.cardIds;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full min-w-[320px] max-w-[320px]"
    >
      <div className="glass-effect rounded-2xl p-4 flex flex-col h-full border border-white/10">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color || '#8b5cf6' }}
            />
            <h2 className="text-lg font-semibold text-white">
              {column.title}
            </h2>
            <span className="text-sm text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
              {cards.length}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              aria-label="Column options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 mt-2 w-48 glass-effect rounded-xl border border-white/10 shadow-lg z-10 overflow-hidden"
              >
                <button
                  onClick={() => {
                    onDeleteColumn(column.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Column
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Cards Area */}
        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto space-y-3 min-h-[200px] pr-2 custom-scrollbar"
        >
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
                onAIGenerate={onAIGenerate}
              />
            ))}
          </SortableContext>

          {cards.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Drop cards here
            </div>
          )}
        </div>

        {/* Add Card Button */}
        <button
          onClick={() => onAddCard(column.id)}
          className="mt-4 w-full py-3 px-4 rounded-xl border-2 border-dashed border-white/20 hover:border-primary-400/50 hover:bg-primary-500/10 text-gray-400 hover:text-primary-300 transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Add Card</span>
        </button>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </motion.div>
  );
}
