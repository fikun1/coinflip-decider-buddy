import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Coin } from '@/components/Coin';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { History, LogIn } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [assignment, setAssignment] = useState<{heads: string, tails: string} | null>(null);
  const [winner, setWinner] = useState<string>('');
  const [user, setUser] = useState(null);

  // Check auth on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
    });
    if (error) {
      toast.error('Error signing in: ' + error.message);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  };

  const saveFlipResult = async (flipData: any) => {
    if (!user) return;

    const { error } = await supabase
      .from('flip_history')
      .insert({
        user_id: user.id,
        option_1: flipData.option1,
        option_2: flipData.option2,
        heads_option: flipData.heads,
        tails_option: flipData.tails,
        result: flipData.result,
        winner: flipData.winner,
      });

    if (error) {
      console.error('Error saving flip:', error);
      toast.error('Failed to save flip to history');
    } else {
      toast.success('Flip saved to history!');
    }
  };

  const flipCoin = async () => {
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
    setTimeout(async () => {
      const flipResult = Math.random() < 0.5 ? 'heads' : 'tails';
      const winningOption = randomAssignment[flipResult];
      
      setResult(flipResult);
      setWinner(winningOption);
      setIsFlipping(false);
      
      // Save to database if user is signed in
      if (user) {
        await saveFlipResult({
          option1,
          option2,
          heads: randomAssignment.heads,
          tails: randomAssignment.tails,
          result: flipResult,
          winner: winningOption,
        });
      }
      
      toast.success(`The coin has decided: ${winningOption}!`);
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
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Coin Flip Decider
          </h1>
          <p className="text-muted-foreground text-lg">
            Let fate decide between your two options
          </p>
          
          {/* Auth & Navigation */}
          <div className="flex justify-center gap-4">
            {user ? (
              <>
                <Button
                  onClick={() => navigate('/history')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <History size={16} />
                  View History
                </Button>
                <Button
                  onClick={signOut}
                  variant="ghost"
                  size="sm"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                onClick={signIn}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogIn size={16} />
                Sign In to Save History
              </Button>
            )}
          </div>
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