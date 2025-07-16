import Head from "next/head";
import styles from "./index.module.css";
import Link from "next/link";
import { MainLayout } from "@/layout/MainLayout";
import { useEffect } from "react";

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from "@/context/LanguageContext";

import PremiumButton from '@/components/PremiumButton';
import CustomButton from '@/components/CustomButton';
import checkFlags from "@/src/checkFlags";
import BuildSwitcher from "@/components/BuildSwitcher";
import PixelIcon from "@/components/PixelIcon";
import CustomHead from "@/components/CustomHead";

export default function Home() {
  const { loggedUser } = useAuth();
  const { language, changeLanguage } = useLanguage();

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let animationId;

    // Classe para o background animado
    class PixelBackground {
      constructor() {
        this.canvas = document.getElementById('pixelCanvas');
        this.floatingContainer = document.getElementById('floatingPixels');
        this.pixels = [];
        this.floatingPixels = [];
        this.colors = [
          '#4FACFE', '#00F2FE', '#43E97B', '#38F9D7',
          '#FA709A', '#FEE140', '#A8EDEA', '#D299C2',
          '#89F7FE', '#66A6FF', '#F093FB', '#F5576C',
          '#4FACFE', '#00F2FE', '#667eea', '#764ba2'
        ];
        this.init();
      }

      init() {
        document.documentElement.style.setProperty('--color-bg', 'transparent');
        this.createPixelGrid();
        this.createFloatingPixels();
        this.startAnimations();
        this.startMouseInteraction();
      }

      createPixelGrid() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        for (let i = 0; i < 80; i++) {
          const pixel = document.createElement('div');
          pixel.className = 'animated-pixel';
          pixel.style.position = 'absolute';
          pixel.style.width = '16px';
          pixel.style.height = '16px';
          pixel.style.opacity = '0';
          pixel.style.borderRadius = '2px';
          pixel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          pixel.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.1)';

          const originalX = Math.random() * screenWidth;
          const originalY = Math.random() * screenHeight;

          pixel.style.left = originalX + 'px';
          pixel.style.top = originalY + 'px';
          pixel.style.backgroundColor = this.colors[Math.floor(Math.random() * this.colors.length)];
          pixel.style.animationDelay = Math.random() * 8 + 's';

          // Armazenar posição original para calcular repulsão
          pixel.originalX = originalX;
          pixel.originalY = originalY;
          pixel.currentX = originalX;
          pixel.currentY = originalY;

          this.canvas.appendChild(pixel);
          this.pixels.push(pixel);
        }
      }

      createFloatingPixels() {
        for (let i = 0; i < 12; i++) {
          setTimeout(() => {
            const pixel = document.createElement('div');
            pixel.className = 'floating-pixel';
            pixel.style.position = 'absolute';
            pixel.style.width = '12px';
            pixel.style.height = '12px';
            pixel.style.borderRadius = '2px';
            pixel.style.opacity = '0.6';
            pixel.style.animation = 'float 15s infinite linear';
            pixel.style.transition = 'transform 0.3s ease-out';

            const startX = Math.random() * window.innerWidth;
            pixel.style.left = startX + 'px';
            pixel.style.animationDelay = Math.random() * 15 + 's';
            pixel.style.backgroundColor = this.colors[Math.floor(Math.random() * this.colors.length)];

            pixel.originalX = startX;
            pixel.currentX = startX;

            this.floatingContainer.appendChild(pixel);
            this.floatingPixels.push(pixel);
          }, i * 1000);
        }
      }

      startMouseInteraction() {
        const updatePixelPositions = () => {
          const repulsionRadius = 520;
          const repulsionForce = 800;

          this.pixels.forEach(pixel => {
            const dx = pixel.currentX - mouseX;
            const dy = pixel.currentY - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < repulsionRadius && distance > 0) {
              const force = (repulsionRadius - distance) / repulsionRadius;
              const repulsionX = (dx / distance) * force * repulsionForce;
              const repulsionY = (dy / distance) * force * repulsionForce;

              pixel.currentX = pixel.originalX + repulsionX;
              pixel.currentY = pixel.originalY + repulsionY;
            } else {
              // Retornar suavemente à posição original
              pixel.currentX += (pixel.originalX - pixel.currentX) * 0.1;
              pixel.currentY += (pixel.originalY - pixel.currentY) * 0.1;
            }

            pixel.style.left = pixel.currentX + 'px';
            pixel.style.top = pixel.currentY + 'px';
          });

          // Aplicar repulsão aos pixels flutuantes também
          this.floatingPixels.forEach(pixel => {
            if (pixel.parentNode) {
              const rect = pixel.getBoundingClientRect();
              const pixelX = rect.left + rect.width / 2;
              const pixelY = rect.top + rect.height / 2;

              const dx = pixelX - mouseX;
              const dy = pixelY - mouseY;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < repulsionRadius && distance > 0) {
                const force = (repulsionRadius - distance) / repulsionRadius;
                const repulsionX = (dx / distance) * force * 30;
                const repulsionY = (dy / distance) * force * 30;

                pixel.style.transform = `translate(${repulsionX}px, ${repulsionY}px)`;
              } else {
                pixel.style.transform = 'translate(0px, 0px)';
              }
            }
          });

          animationId = requestAnimationFrame(updatePixelPositions);
        };

        updatePixelPositions();
      }

      startAnimations() {
        setInterval(() => {
          this.animatePixels();
        }, 4000);

        setInterval(() => {
          this.createNewFloatingPixel();
        }, 2500);
      }

      animatePixels() {
        const randomPixels = this.pixels.sort(() => 0.5 - Math.random()).slice(0, 6);

        randomPixels.forEach((pixel, index) => {
          setTimeout(() => {
            pixel.style.opacity = '0.8';
            pixel.style.transform = 'scale(1.1)';
            pixel.style.backgroundColor = this.colors[Math.floor(Math.random() * this.colors.length)];

            setTimeout(() => {
              pixel.style.opacity = '0';
              pixel.style.transform = 'scale(0.9)';

              setTimeout(() => {
                pixel.style.transform = 'scale(1)';
              }, 1200);
            }, 2500);
          }, index * 300);
        });
      }

      createNewFloatingPixel() {
        const pixel = document.createElement('div');
        pixel.className = 'floating-pixel';
        pixel.style.position = 'absolute';
        pixel.style.width = '12px';
        pixel.style.height = '12px';
        pixel.style.borderRadius = '2px';
        pixel.style.opacity = '0.6';
        pixel.style.animation = 'float 15s infinite linear';
        pixel.style.transition = 'transform 0.3s ease-out';

        const startX = Math.random() * window.innerWidth;
        pixel.style.left = startX + 'px';
        pixel.style.backgroundColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        pixel.originalX = startX;
        pixel.currentX = startX;

        this.floatingContainer.appendChild(pixel);
        this.floatingPixels.push(pixel);

        setTimeout(() => {
          pixel.remove();
          const index = this.floatingPixels.indexOf(pixel);
          if (index > -1) {
            this.floatingPixels.splice(index, 1);
          }
        }, 15000);
      }
    }

    // Listener para movimento do mouse
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Criar elementos do background
    const createBackgroundElements = () => {
      // Criar wave effect
      const waveEffect = document.createElement('div');
      waveEffect.className = 'wave-effect';
      waveEffect.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, 
          rgba(74, 172, 254, 0.03) 0%, 
          transparent 25%, 
          transparent 75%, 
          rgba(74, 172, 254, 0.03) 100%);
        animation: waveMove 25s infinite ease-in-out;
        z-index: -3;
        pointer-events: none;
      `;
      document.body.appendChild(waveEffect);

      // Criar ambient glows
      for (let i = 0; i < 3; i++) {
        const glow = document.createElement('div');
        glow.className = 'ambient-glow';
        glow.style.cssText = `
          position: fixed;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(74, 172, 254, 0.1) 0%, transparent 70%);
          animation: ambientMove ${20 + i * 5}s infinite ease-in-out;
          animation-delay: ${i * 7}s;
          z-index: -3;
          pointer-events: none;
        `;
        document.body.appendChild(glow);
      }

      // Criar grid overlay
      const gridOverlay = document.createElement('div');
      gridOverlay.className = 'grid-overlay';
      gridOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: 
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        background-size: 24px 24px;
        z-index: -2;
        animation: gridMove 30s linear infinite;
        pointer-events: none;
      `;
      document.body.appendChild(gridOverlay);

      // Criar containers para pixels
      const pixelCanvas = document.createElement('div');
      pixelCanvas.id = 'pixelCanvas';
      pixelCanvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        pointer-events: none;
      `;
      document.body.appendChild(pixelCanvas);

      const floatingPixels = document.createElement('div');
      floatingPixels.id = 'floatingPixels';
      floatingPixels.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        pointer-events: none;
      `;
      document.body.appendChild(floatingPixels);
    };

    // Adicionar CSS para animações
    const addAnimationStyles = () => {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          5% {
            opacity: 0.6;
          }
          95% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100px) rotate(180deg);
            opacity: 0;
          }
        }

        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(24px, 24px); }
        }

        @keyframes ambientMove {
          0%, 100% {
            transform: translate(10vw, 10vh) scale(0.8);
          }
          25% {
            transform: translate(80vw, 20vh) scale(1.2);
          }
          50% {
            transform: translate(70vw, 70vh) scale(0.9);
          }
          75% {
            transform: translate(20vw, 80vh) scale(1.1);
          }
        }

        @keyframes waveMove {
          0%, 100% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
        }

        body {
          background: #1a1a2e !important;
        }
      `;
      document.head.appendChild(style);
    };

    // Inicializar background
    addAnimationStyles();
    createBackgroundElements();
    const pixelBg = new PixelBackground();

    // Adicionar listener do mouse
    document.addEventListener('mousemove', handleMouseMove);

    // Cleanup ao desmontar
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      document.querySelectorAll('.wave-effect, .ambient-glow, .grid-overlay').forEach(el => el.remove());
      document.getElementById('pixelCanvas')?.remove();
      document.getElementById('floatingPixels')?.remove();
    };
  }, []);

  return (
    <>
      <CustomHead
        title={language.getString("PAGES.INDEX.META_TITLE")}
        description={language.getString("PAGES.INDEX.META_DESCRIPTION")}
        url={"https://pixelsplace.nemtudo.me/"}
      />
      <MainLayout>
        <main className={styles.main}>
          <div className={styles.logo}>
            <img src="/logo.png" alt={language.getString("PAGES.INDEX.LOGO_ALT")} />
            <h1>Pixels Place</h1>
          </div>
          <div className={styles.buttons}>
            <CustomButton label={language.getString("PAGES.INDEX.START")} icon={'image'} href={"/place"} style={{ fontFamily: 'Dogica Pixel, Arial, Helvetica, sans-serif', fontSize: 'small' }} />
            <CustomButton label={language.getString("PAGES.INDEX.SERVERS")} icon={'server'} href={"/partners"} hierarchy={2} />
            <PremiumButton as={Link} href={"/timetravel"}><PixelIcon codename={"hourglass"} />{language.getString("COMMON.TIME_TRAVEL")}</PremiumButton>
            {
              checkFlags(loggedUser?.flags, "ADMIN_VIEWPAGE") && <CustomButton label={language.getString("COMMON.ADMIN")} icon={'coffee'} href={"/admin"} hierarchy={3} />
            }
            {
              checkFlags(loggedUser?.flags, "BUILD_OVERRIDE_VIEW") && <BuildSwitcher />
            }
          </div>
        </main>
      </MainLayout>
    </>
  );
}