import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Trophy, Target } from 'lucide-react';
import { toast } from 'sonner';

interface FlipRecord {
  id: string;
  option_1: string;
  option_2: string;
  heads_option: string;
  tails_option: string;
  result: 'heads' | 'tails';
  winner: string;
  created_at: string;
}

const FlipHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<FlipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check auth and load history
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadHistory();
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('flip_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load flip history');
        console.error('Error loading history:', error);
      } else {
        setHistory((data || []) as FlipRecord[]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load flip history');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('Are you sure you want to clear all flip history? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('flip_history')
        .delete()
        .eq('user_id', user?.id);

      if (error) {
        toast.error('Failed to clear history');
      } else {
        setHistory([]);
        toast.success('History cleared successfully');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to clear history');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-bg flex flex-col items-center justify-center p-6">
        <Card className="p-8 text-center backdrop-blur-sm bg-card/90">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to sign in to view your flip history.
          </p>
          <Button
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Coin Flip
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Flip History
          </h1>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Flip
            </Button>
            {history.length > 0 && (
              <Button
                onClick={clearHistory}
                variant="destructive"
                size="sm"
              >
                Clear All History
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your flip history...</p>
          </div>
        ) : history.length === 0 ? (
          <Card className="p-12 text-center backdrop-blur-sm bg-card/90">
            <div className="text-6xl mb-4">🪙</div>
            <h2 className="text-2xl font-bold mb-2">No Flips Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start flipping coins to see your history here!
            </p>
            <Button
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              Make Your First Flip
            </Button>
          </Card>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 text-center backdrop-blur-sm bg-card/90">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="text-primary" size={20} />
                  <span className="font-semibold">Total Flips</span>
                </div>
                <div className="text-3xl font-bold text-primary">{history.length}</div>
              </Card>
              <Card className="p-6 text-center backdrop-blur-sm bg-card/90">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="text-primary" size={20} />
                  <span className="font-semibold">Heads Wins</span>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {history.filter(flip => flip.result === 'heads').length}
                </div>
              </Card>
              <Card className="p-6 text-center backdrop-blur-sm bg-card/90">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="text-primary" size={20} />
                  <span className="font-semibold">Tails Wins</span>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {history.filter(flip => flip.result === 'tails').length}
                </div>
              </Card>
            </div>

            {/* History List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center">Recent Flips</h2>
              {history.map((flip) => (
                <Card key={flip.id} className="p-6 backdrop-blur-sm bg-card/90">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* Options */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground">OPTIONS</h3>
                      <div className="space-y-1">
                        <div className="text-sm">{flip.option_1}</div>
                        <div className="text-xs text-muted-foreground">vs</div>
                        <div className="text-sm">{flip.option_2}</div>
                      </div>
                    </div>

                    {/* Result */}
                    <div className="text-center">
                      <div className="text-4xl mb-2">
                        {flip.result === 'heads' ? '👑' : '⚡'}
                      </div>
                      <div className="font-bold text-lg text-primary">
                        {flip.result.toUpperCase()}
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        {flip.winner}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                        <Clock size={14} />
                        {formatDate(flip.created_at)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FlipHistory;