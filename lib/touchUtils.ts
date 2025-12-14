/**
 * Touch event utilities for canvas interactions
 * Converts touch events to mouse-like events for compatibility
 */

export interface TouchPoint {
  clientX: number;
  clientY: number;
}

/**
 * Get the first touch point from a touch event
 */
export function getTouchPoint(e: React.TouchEvent): TouchPoint | null {
  if (e.touches.length > 0) {
    return {
      clientX: e.touches[0].clientX,
      clientY: e.touches[0].clientY,
    };
  }
  if (e.changedTouches.length > 0) {
    return {
      clientX: e.changedTouches[0].clientX,
      clientY: e.changedTouches[0].clientY,
    };
  }
  return null;
}

/**
 * Create a mouse-like event from a touch event
 * This allows touch events to work with existing mouse handlers
 */
export function touchToMouse(e: React.TouchEvent): React.MouseEvent | null {
  const touch = getTouchPoint(e);
  if (!touch) return null;

  // Create a synthetic mouse event
  return {
    ...e,
    clientX: touch.clientX,
    clientY: touch.clientY,
    button: 0,
    buttons: 1,
  } as unknown as React.MouseEvent;
}

/**
 * Unified event handler that works with both mouse and touch
 */
export function createUnifiedHandler<T extends HTMLElement>(
  mouseHandler: (e: React.MouseEvent<T>) => void
) {
  return {
    onMouseDown: mouseHandler,
    onTouchStart: (e: React.TouchEvent<T>) => {
      e.preventDefault(); // Prevent default touch behavior
      const mouseEvent = touchToMouse(e);
      if (mouseEvent) mouseHandler(mouseEvent as React.MouseEvent<T>);
    },
  };
}

export function createUnifiedMoveHandler<T extends HTMLElement>(
  mouseMoveHandler: (e: React.MouseEvent<T>) => void
) {
  return {
    onMouseMove: mouseMoveHandler,
    onTouchMove: (e: React.TouchEvent<T>) => {
      e.preventDefault();
      const mouseEvent = touchToMouse(e);
      if (mouseEvent) mouseMoveHandler(mouseEvent as React.MouseEvent<T>);
    },
  };
}

export function createUnifiedEndHandler<T extends HTMLElement>(
  mouseEndHandler: (e?: React.MouseEvent<T>) => void
) {
  return {
    onMouseUp: mouseEndHandler,
    onMouseLeave: mouseEndHandler,
    onTouchEnd: (e: React.TouchEvent<T>) => {
      e.preventDefault();
      mouseEndHandler();
    },
    onTouchCancel: (e: React.TouchEvent<T>) => {
      e.preventDefault();
      mouseEndHandler();
    },
  };
}
