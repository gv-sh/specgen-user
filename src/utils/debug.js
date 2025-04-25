// Debug utilities for drag and drop

export const logDragEvent = (event, source) => {
  console.log(`[DND ${source}]`, {
    type: event.type,
    active: event.active ? {
      id: event.active.id,
      data: event.active.data?.current
    } : null,
    over: event.over ? {
      id: event.over.id
    } : null
  });
};
