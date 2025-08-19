import { useState } from 'react';

interface CoinProps {
  isFlipping: boolean;
  result: 'heads' | 'tails' | null;
  onFlipComplete?: () => void;
}

export const Coin = ({ isFlipping, result, onFlipComplete }: CoinProps) => {
  const [animationClass, setAnimationClass] = useState('');

  const handleAnimationEnd = () => {
    if (isFlipping) {
      setAnimationClass('');
      onFlipComplete?.();
    }
  };

  const showHeads = result === 'heads' || (!isFlipping && result === null);

  return (
    <div className="perspective-1000 flex justify-center items-center">
      <div
        className={`
          relative w-48 h-48 rounded-full bg-gradient-coin
          border-4 border-coin-gold-light shadow-2xl
          transform-gpu preserve-3d transition-transform duration-1000
          ${isFlipping ? 'animate-flip' : 'hover:scale-105'}
          ${!isFlipping && result ? 'animate-bounce-gentle' : ''}
          ${!isFlipping ? 'animate-pulse-glow' : ''}
        `}
        onAnimationEnd={handleAnimationEnd}
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Heads Side */}
        <div
          className={`
            absolute inset-0 w-full h-full rounded-full bg-gradient-coin
            flex items-center justify-center text-6xl font-bold text-primary-foreground
            backface-hidden border-4 border-coin-gold-light
            ${showHeads ? 'rotate-y-0' : 'rotate-y-180'}
          `}
          style={{
            backfaceVisibility: 'hidden',
            transform: showHeads ? 'rotateY(0deg)' : 'rotateY(180deg)',
          }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">👑</div>
            <div className="text-lg font-semibold">HEADS</div>
          </div>
        </div>

        {/* Tails Side */}
        <div
          className={`
            absolute inset-0 w-full h-full rounded-full bg-gradient-coin
            flex items-center justify-center text-6xl font-bold text-primary-foreground
            backface-hidden border-4 border-coin-gold-light
            ${!showHeads ? 'rotate-y-0' : 'rotate-y-180'}
          `}
          style={{
            backfaceVisibility: 'hidden',
            transform: !showHeads ? 'rotateY(0deg)' : 'rotateY(180deg)',
          }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">⚡</div>
            <div className="text-lg font-semibold">TAILS</div>
          </div>
        </div>

        {/* Edge highlight */}
        <div className="absolute inset-0 rounded-full border-2 border-coin-gold opacity-30 animate-pulse" />
      </div>
    </div>
  );
};