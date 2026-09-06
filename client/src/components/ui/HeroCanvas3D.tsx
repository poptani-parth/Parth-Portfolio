import React, { useEffect, useRef } from'react';
import { useTheme } from'../../context/ThemeContext';

interface Point3D {
 x: number;
 y: number;
 z: number;
 origX: number;
 origY: number;
 origZ: number;
}

export const HeroCanvas3D: React.FC<{ className?: string }> = ({ className ='' }) => {
 const canvasRef = useRef<HTMLCanvasElement | null>(null);
 const containerRef = useRef<HTMLDivElement | null>(null);
 const isVisibleRef = useRef(true);
 const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
 const { theme } = useTheme();
 const isDark = theme ==='dark';

 useEffect(() => {
 const canvas = canvasRef.current;
 if (!canvas) return;
 const ctx = canvas.getContext('2d');
 if (!ctx) return;

 let animationFrameId: number;
 let width = (canvas.width = canvas.offsetWidth);
 let height = (canvas.height = canvas.offsetHeight);

 // Setup intersection observer to pause when scrolled out of view
 const observer = new IntersectionObserver(
 ([entry]) => {
 isVisibleRef.current = entry.isIntersecting;
 },
 { threshold: 0.05 }
 );

 if (containerRef.current) {
 observer.observe(containerRef.current);
 }

 const handleResize = () => {
 if (!canvas) return;
 width = canvas.width = canvas.offsetWidth;
 height = canvas.height = canvas.offsetHeight;
 };

 window.addEventListener('resize', handleResize);

 const handleMouseMove = (e: MouseEvent) => {
 const rect = canvas.getBoundingClientRect();
 const x = (e.clientX - rect.left) / width - 0.5;
 const y = (e.clientY - rect.top) / height - 0.5;
 mouseRef.current.targetX = x * 1.5;
 mouseRef.current.targetY = y * 1.5;
 };

 window.addEventListener('mousemove', handleMouseMove);

 // Generate 3D nodes representing a distributed cluster / hypercube structure
 const nodes: Point3D[] = [];
 const nodeCount = 36;
 const radius = Math.min(width, height) * 0.32;

 for (let i = 0; i < nodeCount; i++) {
 const phi = Math.acos(-1 + (2 * i) / nodeCount);
 const theta = Math.sqrt(nodeCount * Math.PI) * phi;
 const x = radius * Math.cos(theta) * Math.sin(phi);
 const y = radius * Math.sin(theta) * Math.sin(phi);
 const z = radius * Math.cos(phi);
 nodes.push({ x, y, z, origX: x, origY: y, origZ: z });
 }

 let angleX = 0;
 let angleY = 0;

 const render = () => {
 if (isVisibleRef.current && ctx) {
 // Smooth mouse damping
 mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
 mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

 angleY += 0.003 + mouseRef.current.x * 0.01;
 angleX += 0.002 + mouseRef.current.y * 0.01;

 ctx.clearRect(0, 0, width, height);

 const cx = width / 2;
 const cy = height / 2;
 const fov = 450;

 // Project rotated points
 const projected = nodes.map(n => {
 // Rotate Y
 let x1 = n.origX * Math.cos(angleY) + n.origZ * Math.sin(angleY);
 let z1 = -n.origX * Math.sin(angleY) + n.origZ * Math.cos(angleY);

 // Rotate X
 let y2 = n.origY * Math.cos(angleX) - z1 * Math.sin(angleX);
 let z2 = n.origY * Math.sin(angleX) + z1 * Math.cos(angleX);

 // Perspective projection
 const scale = fov / (fov + z2 + 300);
 const px = cx + x1 * scale;
 const py = cy + y2 * scale;
 return { px, py, scale, z: z2 };
 });

 const darkActive = document.documentElement.classList.contains('dark');

 // Draw connecting edges (mesh connections)
 ctx.lineWidth = 1;
 for (let i = 0; i < projected.length; i++) {
 for (let j = i + 1; j < projected.length; j++) {
 const p1 = projected[i];
 const p2 = projected[j];
 const dist = Math.hypot(p1.px - p2.px, p1.py - p2.py);
 if (dist < 110) {
 const alpha = (1 - dist / 110) * 0.22 * ((p1.scale + p2.scale) / 2);
 ctx.strokeStyle = darkActive 
 ?`rgba(255, 255, 255, ${alpha})`
 :`rgba(15, 23, 42, ${alpha * 1.2})`;
 ctx.beginPath();
 ctx.moveTo(p1.px, p1.py);
 ctx.lineTo(p2.px, p2.py);
 ctx.stroke();
 }
 }
 }

 // Draw nodes & pulse glow
 projected.forEach((p, idx) => {
 const size = Math.max(1.6, 3.2 * p.scale);
 const isCore = idx % 5 === 0;

 if (darkActive) {
 // Outer aura
 ctx.fillStyle = isCore ?'rgba(255, 255, 255, 0.35)' :'rgba(161, 161, 170, 0.2)';
 ctx.beginPath();
 ctx.arc(p.px, p.py, size * 2, 0, Math.PI * 2);
 ctx.fill();

 // Core point
 ctx.fillStyle = isCore ?'#ffffff' :'#a1a1aa';
 ctx.beginPath();
 ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
 ctx.fill();
 } else {
 // Light mode outer aura
 ctx.fillStyle = isCore ?'rgba(16, 185, 129, 0.25)' :'rgba(71, 85, 105, 0.15)';
 ctx.beginPath();
 ctx.arc(p.px, p.py, size * 2, 0, Math.PI * 2);
 ctx.fill();

 // Light mode core point
 ctx.fillStyle = isCore ?'#059669' :'#475569';
 ctx.beginPath();
 ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
 ctx.fill();
 }
 });
 }

 animationFrameId = requestAnimationFrame(render);
 };

 render();

 return () => {
 cancelAnimationFrame(animationFrameId);
 window.removeEventListener('resize', handleResize);
 window.removeEventListener('mousemove', handleMouseMove);
 observer.disconnect();
 };
 }, [isDark]);

 return (
 <div ref={containerRef} className={`relative w-full h-full pointer-events-none overflow-hidden ${className}`}>
 <canvas ref={canvasRef} className="w-full h-full block" />
 </div>
 );
};
