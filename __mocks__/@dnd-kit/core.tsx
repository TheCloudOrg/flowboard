import React from 'react';

// Mock DndContext
export const DndContext = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dnd-context">{children}</div>
);

// Mock DragOverlay
export const DragOverlay = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="drag-overlay">{children}</div>
);

// Mock hooks
export const useDraggable = jest.fn((config) => ({
  attributes: { role: 'button', tabIndex: 0 },
  listeners: {
    onPointerDown: jest.fn(),
  },
  setNodeRef: jest.fn(),
  transform: null,
  isDragging: false,
}));

export const useDroppable = jest.fn((config) => ({
  setNodeRef: jest.fn(),
  isOver: false,
  active: null,
  over: null,
}));

// Mock sensors
export const useSensor = jest.fn();
export const useSensors = jest.fn(() => []);
export const PointerSensor = jest.fn();
export const KeyboardSensor = jest.fn();
export const TouchSensor = jest.fn();
export const MouseSensor = jest.fn();

// Mock collision detection
export const closestCenter = jest.fn();
export const closestCorners = jest.fn();
export const rectIntersection = jest.fn();
export const pointerWithin = jest.fn();

// Mock modifiers
export const restrictToVerticalAxis = jest.fn();
export const restrictToHorizontalAxis = jest.fn();
export const restrictToWindowEdges = jest.fn();
