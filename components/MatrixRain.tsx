"use client";

import { useEffect, useRef, useMemo } from "react";

interface Drop {
  x: number;
  y: number;
  char: string;
  speed: number;
}

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Memoize characters array
  const charArray = useMemo(() => {
    const chars =
      "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return chars.split("");
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const fontSize = 16;
    let drops: Drop[] = [];
    let animationFrameId: number;

    // Set canvas size to viewport
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Reinitialize drops for new dimensions
      const columns = Math.ceil(window.innerWidth / fontSize);
      drops = Array.from({ length: columns }, (_, i) => ({
        x: i * fontSize,
        y: Math.random() * window.innerHeight,
        char: charArray[Math.floor(Math.random() * charArray.length)],
        speed: 1 + Math.random() * 0.5,
      }));
    };

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      drops.forEach((drop) => {
        const gradient = ctx.createLinearGradient(
          drop.x,
          drop.y - fontSize * 3,
          drop.x,
          drop.y
        );
        gradient.addColorStop(0, "#00ff00");
        gradient.addColorStop(1, "#003300");
        ctx.fillStyle = gradient;

        ctx.globalAlpha = drop.y < canvas.height / 2 ? 0.8 : 0.5;
        ctx.fillText(drop.char, drop.x, drop.y);

        drop.y += (drop.speed * fontSize) / 2;

        if (drop.y > canvas.height) {
          drop.y = 0;
          drop.char = charArray[Math.floor(Math.random() * charArray.length)];
          drop.speed = 1 + Math.random() * 0.5;
        }

        if (Math.random() < 0.05) {
          drop.char = charArray[Math.floor(Math.random() * charArray.length)];
        }
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    // Handle resize
    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener("resize", handleResize);
    setCanvasSize();
    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [charArray]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        opacity: 0.7,
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      }}
    />
  );
};

export default MatrixRain;
