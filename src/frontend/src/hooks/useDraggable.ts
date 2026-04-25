import { useCallback, useEffect, useRef, useState } from "react";
import { loadData, saveData } from "../utils/localStorage";

export interface DragPos {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  /** localStorage key to persist position */
  storageKey: string;
  /** Default position when no saved position exists */
  defaultPos: DragPos;
  /** Size of the element for clamping to viewport */
  elementSize: { w: number; h: number };
}

interface UseDraggableReturn {
  pos: DragPos;
  isDragging: boolean;
  /** true if pointer moved >5px during current drag session (drag vs tap detection) */
  hasDragged: React.MutableRefObject<boolean>;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  /** Spread onto the draggable element to prevent browser scroll/gesture interference */
  style: React.CSSProperties;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function useDraggable({
  storageKey,
  defaultPos,
  elementSize,
}: UseDraggableOptions): UseDraggableReturn {
  const [pos, setPos] = useState<DragPos>(() =>
    loadData<DragPos>(storageKey, defaultPos),
  );
  const [isDragging, setIsDragging] = useState(false);

  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const startPoint = useRef({ x: 0, y: 0 });
  /** Set to true if movement during this drag session exceeded 5px */
  const hasDragged = useRef(false);

  const clampToViewport = useCallback(
    (x: number, y: number): DragPos => {
      const vw = typeof window !== "undefined" ? window.innerWidth : 800;
      const vh = typeof window !== "undefined" ? window.innerHeight : 600;
      return {
        x: clamp(x, 0, Math.max(0, vw - elementSize.w)),
        y: clamp(y, 0, Math.max(0, vh - elementSize.h)),
      };
    },
    [elementSize.w, elementSize.h],
  );

  const startDrag = useCallback(
    (clientX: number, clientY: number, currentPos: DragPos) => {
      dragging.current = true;
      hasDragged.current = false;
      startPoint.current = { x: clientX, y: clientY };
      dragOffset.current = {
        x: clientX - currentPos.x,
        y: clientY - currentPos.y,
      };
      setIsDragging(true);
    },
    [],
  );

  // We need access to current pos in startDrag — use a ref
  const posRef = useRef(pos);
  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      startDrag(e.clientX, e.clientY, posRef.current);
    },
    [startDrag],
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // preventDefault on touchstart prevents the browser from claiming the
      // touch for scrolling before we can begin dragging.
      // NOTE: the element must have touch-action:none (via returned `style`)
      // for this to be effective. The event listener added in the useEffect
      // below is registered with passive:false so preventDefault works there.
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY, posRef.current);
    },
    [startDrag],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - startPoint.current.x;
      const dy = e.clientY - startPoint.current.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasDragged.current = true;
      const newPos = clampToViewport(
        e.clientX - dragOffset.current.x,
        e.clientY - dragOffset.current.y,
      );
      setPos(newPos);
    };

    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setIsDragging(false);
      // Save final position
      saveData(storageKey, posRef.current);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - startPoint.current.x;
      const dy = touch.clientY - startPoint.current.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasDragged.current = true;
      const newPos = clampToViewport(
        touch.clientX - dragOffset.current.x,
        touch.clientY - dragOffset.current.y,
      );
      setPos(newPos);
    };

    const onTouchEnd = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setIsDragging(false);
      saveData(storageKey, posRef.current);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [storageKey, clampToViewport]);

  // Mandatory inline style for the draggable element.
  // touch-action:none tells the browser "do NOT claim this touch for scrolling
  // or zooming" — this is the key fix that makes touch drag work on mobile.
  // user-select:none prevents text selection artefacts during drag.
  const style: React.CSSProperties = {
    touchAction: "none",
    userSelect: "none",
  };

  return { pos, isDragging, hasDragged, onMouseDown, onTouchStart, style };
}
