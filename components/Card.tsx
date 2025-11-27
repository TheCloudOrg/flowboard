'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Grip, Trash2, Edit, Sparkles } from 'lucide-react';
import { Card as CardType } from '@/types';

interface CardProps {
  card: CardType;
  columnColor?: string;
  onView: (card: CardType) => void;
  onEdit: (card: CardType) => void;
  onDelete: (cardId: string) => void;
  onAIGenerate: (card: CardType) => void;
}

export default function Card({
  card,
  columnColor,
  onView,
  onEdit,
  onDelete,
  onAIGenerate,
}: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className="group relative"
    >
      <div className="glass-effect card-gradient rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 hover:border-primary-400/30">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 p-1 rounded-lg cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-gray-500/20 hover:bg-gray-500/30"
          onClick={(e) => e.stopPropagation()}
        >
          <Grip className="w-4 h-4 dark:text-gray-400 light:text-gray-500 dark:hover:text-white light:hover:text-gray-900" />
        </div>

        {/* Card Content */}
        <div className="cursor-pointer" onClick={() => onView(card)}>
          {/* Title */}
          <h3 className="text-lg font-semibold dark:text-white light:text-gray-900 mb-2 pr-8">
            {card.title}
          </h3>

          {/* Tech Stack */}
          {card.techStack && (
            <p className="text-xs dark:text-gray-500 light:text-gray-500 mb-3">{card.techStack}</p>
          )}

          {/* Card Footer */}
          <div className="flex items-center justify-between mt-3">
            {/* Date */}
            <span className="text-xs dark:text-gray-400 light:text-gray-500">
              {new Date(card.updatedAt).toLocaleDateString()}
            </span>

            {/* AI Prompt Button - Color-coded to column */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAIGenerate(card);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all shadow-sm"
              style={{
                backgroundColor: columnColor ? `${columnColor}33` : 'rgba(139, 92, 246, 0.2)',
                color: columnColor || '#a78bfa',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = columnColor
                  ? `${columnColor}4D`
                  : 'rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = columnColor
                  ? `${columnColor}33`
                  : 'rgba(139, 92, 246, 0.2)';
              }}
              aria-label="Generate AI prompt"
            >
              <Sparkles className="w-3 h-3" />
              <span className="text-xs font-medium">AI Prompt</span>
            </button>
          </div>
        </div>

        {/* Edit & Delete - Hover Only (Top Right) */}
        <div className="absolute top-2 right-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card);
            }}
            className="p-1 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 dark:text-primary-300 light:text-primary-600 dark:hover:text-primary-200 light:hover:text-primary-700 transition-colors"
            aria-label="Edit card"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 dark:text-red-300 light:text-red-600 dark:hover:text-red-200 light:hover:text-red-700 transition-colors"
            aria-label="Delete card"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
