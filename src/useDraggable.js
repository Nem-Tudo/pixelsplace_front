import { useRef, useState, useEffect } from 'react';

export default function useDraggable(initialPosition = { x: 0, y: 0 }) {
  const movePixelInfoRef = useRef(null);
  const [position, setPosition] = useState(initialPosition);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState('right');

  // Função para pegar coordenadas (mouse ou toque)
  function getEventCoordinates(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  useEffect(() => {
    function handleMove(e) {
      if (!dragging) return;
      const { x, y } = getEventCoordinates(e);
      const newX = x - offset.x;
      const newY = y - offset.y;
      setPosition({ x: newX, y: newY });
    }

    function handleEnd() {
      setDragging(false);
      const center = window.innerWidth / 2;
      setDirection(position.x < center ? 'left' : 'right');
    }

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [dragging, offset, position.x]);

  function handleMouseDown(e) {
    const coords = getEventCoordinates(e);
    const rect = movePixelInfoRef.current.getBoundingClientRect();
    setOffset({
      x: coords.x - rect.left,
      y: coords.y - rect.top,
    });
    setDragging(true);
  }

  return {
    movePixelInfoRef,
    position,
    handleMouseDown,
    direction,
    dragging,
  };
}
