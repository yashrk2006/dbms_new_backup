'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const NeuralParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      speed: number;
      size: number;
      opacity: number;
      direction: 'h' | 'v';

      constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.speed = 0.5 + Math.random() * 2;
        this.size = 1 + Math.random() * 2;
        this.opacity = 0.1 + Math.random() * 0.4;
        this.direction = Math.random() > 0.5 ? 'h' : 'v';
      }

      update(width: number, height: number) {
        if (this.direction === 'h') {
          this.x += this.speed;
          if (this.x > width) this.x = 0;
        } else {
          this.y += this.speed;
          if (this.y > height) this.y = 0;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 158, 11, ${this.opacity})`;
        ctx.fill();
        
        // Add a small trail
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
      }
    }

    const init = () => {
      particles = Array.from({ length: 50 }, () => new Particle(canvas.width, canvas.height));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update(canvas.width, canvas.height);
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] opacity-30"
    />
  );
};
