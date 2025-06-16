import { useRef, useState, useEffect } from 'react';
import { MdDragIndicator } from "react-icons/md";

export default function useDraggable(initialPosition = { x: 0, y: 0 }, targetDevice = 'both') {
  const movePixelInfoRef = useRef(null);
  const [position, setPosition] = useState(initialPosition);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState('right');
  const styleDrag = {
    position: 'absolute',
    top: `${position.y}px`,
    left: `${position.x}px`,
    zIndex: 9999,
  };

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

  // Escolha o ícone correto baseado no targetDevice
  let iconDrag = null;
  if (targetDevice === 'desktop') {
    iconDrag = (
      <MdDragIndicator
        onMouseDown={handleMouseDown}
        style={{ cursor: 'move' }}
      />
    );
  } else if (targetDevice === 'mobile') {
    iconDrag = (
      <MdDragIndicator
        onTouchStart={handleMouseDown}
        style={{ cursor: 'move' }}
      />
    );
  } else {
    // both
    iconDrag = (
      <MdDragIndicator
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        style={{ cursor: 'move' }}
      />
    );
  }

  return {
    movePixelInfoRef,
    // position,
    // handleMouseDown,
    direction,
    // dragging,
    styleDrag,
    iconDrag,
  };
}

{/*
  como utiliar:

const {
  movePixelInfoRef,
  direction,
  styleDrag,
  iconDrag,
} = useDraggable({ x: initialX, y: initialY }, 'escolha para onde sera utilizado: desktop | mobile | both');

<div
  ref={movePixelInfoRef}
  style={styleDrag}
>
<div style={{ style para definir o local aonde vai ficar o icon }}>
  {iconDrag}
</div>
*/}
