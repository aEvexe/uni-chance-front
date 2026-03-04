import { useEffect, useState } from 'react';

export default function Splash({ onDone }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 2000;
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 2600);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="ts-splash">
      <div className="ts-splash-content">
        <div className="ts-subtitle">Welcome to</div>
        <div className="ts-title">
          {'UNI-CHANCE'.split('').map((ch, i) => (
            <span key={i} className="ts-letter" style={{ animationDelay: `${0.3 + i * 0.05}s` }}>
              {ch}
            </span>
          ))}
        </div>
        <div className="ts-byline">Your future starts here</div>
        <div className="ts-italic">Loading...</div>
        <div className="ts-bar-track">
          <div className="ts-bar-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
