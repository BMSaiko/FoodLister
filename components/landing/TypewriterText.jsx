'use client';
import { useState, useEffect } from 'react';

export default function TypewriterText({ text, delay = 0, speed = 50, className = '' }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayed(text.slice(0, displayed.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setDone(true);
    }
  }, [displayed, text, speed, started]);

  return (
    <span className={className}>
      {displayed}
      <span
        className="inline-block w-[3px] h-[1.1em] bg-[var(--primary)] ml-1 align-middle"
        style={{ opacity: done ? undefined : 1 }}
      />
      {done && (
        <span className="inline-block w-[3px] h-[1.1em] bg-[var(--primary)] ml-[-3px] align-middle animate-blink" />
      )}
    </span>
  );
}
