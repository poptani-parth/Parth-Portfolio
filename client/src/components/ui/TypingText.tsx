import React, { useState, useEffect } from'react';

interface TypingTextProps {
 text: string;
 speed?: number;
 delay?: number;
 className?: string;
}

export const TypingText: React.FC<TypingTextProps> = ({
 text,
 speed = 35,
 delay = 300,
 className =''
}) => {
 const [displayedText, setDisplayedText] = useState('');
 const [isDone, setIsDone] = useState(false);

 useEffect(() => {
 // Check if user prefers reduced motion
 const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if (prefersReducedMotion) {
 setDisplayedText(text);
 setIsDone(true);
 return;
 }

 let timeoutId: NodeJS.Timeout;
 let currentIndex = 0;

 const startTyping = () => {
 const intervalId = setInterval(() => {
 if (currentIndex < text.length) {
 setDisplayedText(text.slice(0, currentIndex + 1));
 currentIndex++;
 } else {
 clearInterval(intervalId);
 setIsDone(true);
 }
 }, speed);

 return () => clearInterval(intervalId);
 };

 timeoutId = setTimeout(startTyping, delay);

 return () => {
 clearTimeout(timeoutId);
 };
 }, [text, speed, delay]);

 return (
 <span className={`inline-block ${className}`}>
 {displayedText}
 {!isDone && (
 <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse align-middle" />
 )}
 </span>
 );
};
