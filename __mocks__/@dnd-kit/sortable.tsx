import React from 'react';

// Mock SortableContext
export const SortableContext = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="sortable-context">{children}</div>
);

// Mock useSortable hook
export const useSortable = jest.fn((config) => ({
  attributes: { role: 'button', tabIndex: 0 },
  listeners: {
    onPointerDown: jest.fn(),
  },
  setNodeRef: jest.fn(),
  transform: null,
  transition: null,
  isDragging: false,
  isSorting: false,
  over: null,
  overIndex: -1,
  activeIndex: -1,
  index: 0,
}));

// Mock sorting strategies
export const verticalListSortingStrategy = 'vertical';
export const horizontalListSortingStrategy = 'horizontal';
export const rectSortingStrategy = 'rect';
export const rectSwappingStrategy = 'rect-swapping';

// Mock array utilities
export const arrayMove = jest.fn((array, from, to) => {
  const newArray = [...array];
  const item = newArray.splice(from, 1)[0];
  newArray.splice(to, 0, item);
  return newArray;
});

export const arraySwap = jest.fn((array, indexA, indexB) => {
  const newArray = [...array];
  const temp = newArray[indexA];
  newArray[indexA] = newArray[indexB];
  newArray[indexB] = temp;
  return newArray;
});
