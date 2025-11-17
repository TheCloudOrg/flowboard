'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Grip, Trash2, Edit } from 'lucide-react';
import { Card as CardType } from '@/types';

interface CardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (cardId: string) => void;
}

export default function Card({ card, onEdit, onDelete }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

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
      <div className="glass-effect card-gradient rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 border border-white/10 hover:border-primary-400/30">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Grip className="w-4 h-4 text-gray-400 hover:text-white" />
        </div>

        {/* Card Content */}
        <div className="pr-8">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
            {card.title}
          </h3>

          {card.description && (
            <p className="text-sm text-gray-300 mb-3 line-clamp-3">
              {card.description}
            </p>
          )}

          {card.notes && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-gray-400 line-clamp-2">
                {card.notes}
              </p>
            </div>
          )}

          {/* Card Footer */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-500">
              {new Date(card.updatedAt).toLocaleDateString()}
            </span>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(card)}
                className="p-1.5 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 hover:text-primary-200 transition-colors"
                aria-label="Edit card"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(card.id)}
                className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 transition-colors"
                aria-label="Delete card"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
