// useDraggable.js
import { useRef, useState, useEffect } from 'react';

export default function useDraggable(initialPosition = { x: 0, y: 0 }) {
  const elementRef = useRef(null);
  const [position, setPosition] = useState(initialPosition);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState('right'); // padrão inicial

  useEffect(() => {
    function handleMouseMove(e) {
      if (!dragging) return;
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;
      setPosition({ x: newX, y: newY });
    }

    function handleMouseUp() {
      setDragging(false);
      const center = window.innerWidth / 2;
      setDirection(position.x < center ? 'left' : 'right');
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, offset, position.x]);

  function handleMouseDown(e) {
    const rect = elementRef.current.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDragging(true);
  }

  return {
    elementRef,
    position,
    handleMouseDown,
    direction,
  };
}
