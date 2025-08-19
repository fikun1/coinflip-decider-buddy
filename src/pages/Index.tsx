import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Coin } from '@/components/Coin';
import { toast } from 'sonner';

const Index = () => {
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [assignment, setAssignment] = useState<{heads: string, tails: string} | null>(null);
  const [winner, setWinner] = useState<string>('');

  const flipCoin = () => {
    if (!option1.trim() || !option2.trim()) {
      toast.error('Please enter both options before flipping!');
      return;
    }

    setIsFlipping(true);
    setResult(null);
    setWinner('');

    // Randomly assign options to heads/tails
    const randomAssignment = Math.random() < 0.5 
      ? { heads: option1, tails: option2 }
      : { heads: option2, tails: option1 };
    
    setAssignment(randomAssignment);

    // Simulate coin flip result after a delay
    setTimeout(() => {
      const flipResult = Math.random() < 0.5 ? 'heads' : 'tails';
      setResult(flipResult);
      setWinner(randomAssignment[flipResult]);
      setIsFlipping(false);
      
      toast.success(`The coin has decided: ${randomAssignment[flipResult]}!`);
    }, 1000);
  };

  const reset = () => {
    setOption1('');
    setOption2('');
    setResult(null);
    setAssignment(null);
    setWinner('');
    setIsFlipping(false);
  };

  return (
    <div className="min-h-screen bg-gradient-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Coin Flip Decider
          </h1>
          <p className="text-muted-foreground text-lg">
            Let fate decide between your two options
          </p>
        </div>

        {/* Input Section */}
        <Card className="p-8 space-y-6 backdrop-blur-sm bg-card/90">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Option 1</label>
              <Input
                placeholder="Enter first option..."
                value={option1}
                onChange={(e) => setOption1(e.target.value)}
                className="h-12 text-lg"
                disabled={isFlipping}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Option 2</label>
              <Input
                placeholder="Enter second option..."
                value={option2}
                onChange={(e) => setOption2(e.target.value)}
                className="h-12 text-lg"
                disabled={isFlipping}
              />
            </div>
          </div>

          {/* Assignment Display */}
          {assignment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
              <div className="text-center p-3 rounded-lg bg-card">
                <div className="text-2xl mb-1">👑</div>
                <div className="font-semibold text-primary">HEADS</div>
                <div className="text-sm text-muted-foreground">{assignment.heads}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-card">
                <div className="text-2xl mb-1">⚡</div>
                <div className="font-semibold text-primary">TAILS</div>
                <div className="text-sm text-muted-foreground">{assignment.tails}</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={flipCoin}
              disabled={isFlipping || !option1.trim() || !option2.trim()}
              size="lg"
              className="px-8 py-3 text-lg font-semibold transition-all hover:scale-105"
            >
              {isFlipping ? 'Flipping...' : 'Flip Coin'}
            </Button>
            
            {(result || option1 || option2) && (
              <Button
                onClick={reset}
                variant="outline"
                size="lg"
                className="px-8 py-3 text-lg"
                disabled={isFlipping}
              >
                Reset
              </Button>
            )}
          </div>
        </Card>

        {/* Coin */}
        <div className="flex justify-center">
          <Coin
            isFlipping={isFlipping}
            result={result}
          />
        </div>

        {/* Result */}
        {winner && !isFlipping && (
          <Card className="p-6 text-center backdrop-blur-sm bg-primary/10 border-primary/20">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-primary">Decision Made!</h2>
              <p className="text-xl font-semibold text-foreground">
                The winner is: <span className="text-primary">{winner}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                The coin landed on {result?.toUpperCase()}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;