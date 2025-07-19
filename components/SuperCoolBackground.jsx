import { useEffect, useRef, useState } from "react";
import styles from './SuperCoolBackground.module.css';

export default function SuperCoolBackground() {
  const [pixels, setPixels] = useState([]);
  const [floatingPixels, setFloatingPixels] = useState([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const deviceOrientation = useRef({ beta: 0, gamma: 0 });
  const animationFrameId = useRef(null);

  const colors = [
    '#4FACFE', '#00F2FE', '#43E97B', '#38F9D7',
    '#FA709A', '#FEE140', '#A8EDEA', '#D299C2',
    '#89F7FE', '#66A6FF', '#F093FB', '#F5576C',
    '#667eea', '#764ba2'
  ];

  // Initialize static pixels
  useEffect(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const initialPixels = Array.from({ length: 80 }, (_, i) => ({
      id: i,
      originalX: Math.random() * screenWidth,
      originalY: Math.random() * screenHeight,
      currentX: 0,
      currentY: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 0,
      scale: 1,
      animationDelay: Math.random() * 8
    }));

    initialPixels.forEach(pixel => {
      pixel.currentX = pixel.originalX;
      pixel.currentY = pixel.originalY;
    });

    setPixels(initialPixels);
  }, []);

  // Initialize floating pixels
  useEffect(() => {
    const initialFloatingPixels = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      color: colors[Math.floor(Math.random() * colors.length)],
      animationDelay: Math.random() * 15,
      transformX: 0,
      transformY: 0
    }));

    setFloatingPixels(initialFloatingPixels);
  }, []);

  // Mouse movement handler
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Device orientation handler
  useEffect(() => {
    const handleOrientation = (event) => {
      const maxTilt = 30;
      const beta = Math.max(-maxTilt, Math.min(maxTilt, event.beta || 0));
      const gamma = Math.max(-maxTilt, Math.min(maxTilt, event.gamma || 0));
      deviceOrientation.current = { beta, gamma };
    };

    if (typeof DeviceOrientationEvent !== 'undefined') {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // Animation loop for pixel interactions
  useEffect(() => {
    const updatePositions = () => {
      const repulsionRadius = 520;
      const repulsionForce = 800;
      const gravityForce = 0.5;
      const gravityX = (deviceOrientation.current.gamma / 30) * gravityForce;
      const gravityY = (deviceOrientation.current.beta / 30) * gravityForce;

      setPixels(prevPixels => 
        prevPixels.map(pixel => {
          const dx = pixel.currentX - mousePos.current.x;
          const dy = pixel.currentY - mousePos.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          let targetX = pixel.originalX + gravityX * 50;
          let targetY = pixel.originalY + gravityY * 50;

          if (distance < repulsionRadius && distance > 0) {
            const force = (repulsionRadius - distance) / repulsionRadius;
            const repulsionX = (dx / distance) * force * repulsionForce;
            const repulsionY = (dy / distance) * force * repulsionForce;

            return {
              ...pixel,
              currentX: targetX + repulsionX,
              currentY: targetY + repulsionY
            };
          } else {
            return {
              ...pixel,
              currentX: pixel.currentX + (targetX - pixel.currentX) * 0.1,
              currentY: pixel.currentY + (targetY - pixel.currentY) * 0.1
            };
          }
        })
      );

      setFloatingPixels(prevFloating =>
        prevFloating.map(pixel => {
          const transformX = gravityX * 20;
          const transformY = gravityY * 20;
          return { ...pixel, transformX, transformY };
        })
      );

      animationFrameId.current = requestAnimationFrame(updatePositions);
    };

    updatePositions();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Pixel animations
  useEffect(() => {
    const animatePixels = () => {
      const randomIndices = Array.from({ length: 6 }, () => Math.floor(Math.random() * pixels.length));
      
      randomIndices.forEach((index, i) => {
        setTimeout(() => {
          setPixels(prev => prev.map((pixel, pixelIndex) => {
            if (pixelIndex === index) {
              return {
                ...pixel,
                opacity: 0.8,
                scale: 1.1,
                color: colors[Math.floor(Math.random() * colors.length)]
              };
            }
            return pixel;
          }));

          setTimeout(() => {
            setPixels(prev => prev.map((pixel, pixelIndex) => {
              if (pixelIndex === index) {
                return { ...pixel, opacity: 0, scale: 0.9 };
              }
              return pixel;
            }));

            setTimeout(() => {
              setPixels(prev => prev.map((pixel, pixelIndex) => {
                if (pixelIndex === index) {
                  return { ...pixel, scale: 1 };
                }
                return pixel;
              }));
            }, 1200);
          }, 2500);
        }, i * 300);
      });
    };

    const interval = setInterval(animatePixels, 4000);
    return () => clearInterval(interval);
  }, [pixels.length]);

  // New floating pixels
  useEffect(() => {
    const createNewPixel = () => {
      const newPixel = {
        id: Date.now(),
        x: Math.random() * window.innerWidth,
        color: colors[Math.floor(Math.random() * colors.length)],
        animationDelay: 0,
        transformX: 0,
        transformY: 0
      };

      setFloatingPixels(prev => [...prev, newPixel]);

      setTimeout(() => {
        setFloatingPixels(prev => prev.filter(p => p.id !== newPixel.id));
      }, 15000);
    };

    const interval = setInterval(createNewPixel, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className={styles.backgroundContainer}>
        {/* Wave Effect */}
        <div className={styles.waveEffect} />

        {/* Ambient Glows */}
        <div className={[styles.ambientGlow, styles.ambientGlow1].join(' ')} />
        <div className={[styles.ambientGlow, styles.ambientGlow2].join(' ')} />
        <div className={[styles.ambientGlow, styles.ambientGlow3].join(' ')} />

        {/* Grid Overlay */}
        <div className={styles.gridOverlay} />

        {/* Static Pixels */}
        {pixels.map(pixel => (
          <div
            key={pixel.id}
            className={styles.pixel}
            style={{
              left: `${pixel.currentX}px`,
              top: `${pixel.currentY}px`,
              backgroundColor: pixel.color,
              opacity: pixel.opacity,
              transform: `scale(${pixel.scale})`,
              animationDelay: `${pixel.animationDelay}s`
            }}
          />
        ))}

        {/* Floating Pixels */}
        {floatingPixels.map(pixel => (
          <div
            key={pixel.id}
            className={styles.floatingPixel}
            style={{
              left: `${pixel.x}px`,
              backgroundColor: pixel.color,
              animationDelay: `${pixel.animationDelay}s`,
              transform: `translate(${pixel.transformX}px, ${pixel.transformY}px)`
            }}
          />
        ))}
      </div>
    </>
  );
}