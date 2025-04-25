// Helper functions for drag and drop functionality

export const initDragData = (parameter, value) => {
  return {
    id: parameter.id,
    name: parameter.name,
    description: parameter.description,
    type: parameter.type,
    categoryId: parameter.categoryId,
    value: value
  };
};

export const preventDefaultWhenDragging = (e) => {
  // Prevents inputs and controls from capturing drag events
  if (e.currentTarget.classList.contains('dragging')) {
    e.preventDefault();
    return false;
  }
  return true;
};
