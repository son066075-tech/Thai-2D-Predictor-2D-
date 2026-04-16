import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Clock, History, TrendingUp, Calendar, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInSeconds } from 'date-fns';
import { getNextSession, generatePredictions, Prediction, Session } from '@/src/lib/predictor';

export default function App() {
  const [now, setNow] = useState(new Date());
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [currentSession, setCurrentSession] = useState<{ session: Session; time: Date }>(getNextSession());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = new Date();
      setNow(currentTime);
      setCurrentSession(getNextSession(currentTime));
    }, 1000);

    // Load history from local storage
    const saved = localStorage.getItem('2d_history');
    if (saved) {
      setPredictions(JSON.parse(saved));
    }

    return () => clearInterval(timer);
  }, []);

  const handleCopy = (numbers: string[]) => {
    navigator.clipboard.writeText(numbers.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePredict = () => {
    const dateStr = format(now, 'yyyy-MM-dd');
    const session = currentSession.session;
    
    // Check if already predicted for this session
    const exists = predictions.find(p => p.date === dateStr && p.session === session);
    if (exists) return;

    const newNumbers = generatePredictions(session, dateStr);
    const newPrediction: Prediction = {
      id: Math.random().toString(36).substr(2, 9),
      date: dateStr,
      session,
      numbers: newNumbers,
      timestamp: Date.now(),
    };

    const updated = [newPrediction, ...predictions].slice(0, 20);
    setPredictions(updated);
    localStorage.setItem('2d_history', JSON.stringify(updated));
  };

  const getTimeRemaining = () => {
    const diff = differenceInSeconds(currentSession.time, now);
    if (diff <= 0) return "တွက်ချက်နိုင်ပါပြီ";
    
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isPredictionAvailable = () => {
    const dateStr = format(now, 'yyyy-MM-dd');
    const exists = predictions.find(p => p.date === dateStr && p.session === currentSession.session);
    return !exists;
  };

  return (
    <div className="min-h-screen font-sans text-white selection:bg-accent-blue/30">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 h-20 px-4 md:px-10 flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-black tracking-[0.2em] text-accent-blue uppercase">SET 2D PREDICT</h1>
          <span className="text-[10px] text-text-dim uppercase tracking-widest hidden md:block">Thailand SET 2D Prediction Engine</span>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden sm:flex flex-col items-end">
            <div className="text-[10px] text-text-dim uppercase tracking-widest">Market Status</div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></span>
              <span className="text-sm font-bold text-accent-green">OPEN</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-[10px] text-text-dim uppercase tracking-widest">{format(now, 'MMM dd, yyyy')}</div>
            <div className="text-lg md:text-xl font-mono font-bold text-accent-blue leading-none">
              {format(now, 'HH:mm:ss')}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-10 space-y-10">
        {/* Hero Section */}
        <section className="space-y-2">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">မြန်မာ-ထိုင်း 2D ခန့်မှန်းချက်</h2>
          <p className="text-text-dim text-sm md:text-base max-w-2xl">
            AI အယ်လ်ဂိုရီသမ်ဖြင့် နေ့စဉ်တွက်ချက်ပေးသော အကောင်းဆုံးဂဏန်းများ။ ထိုင်းနိုင်ငံ စလော့စျေးကွက် ခန့်မှန်းခြေဂဏန်းများ။
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Predictor Area */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="glass-card border-none rounded-[32px] overflow-hidden shadow-2xl">
              <CardHeader className="border-b border-white/10 py-6 px-8">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                      <TrendingUp className="text-accent-blue" size={24} />
                      လက်ရှိ ခန့်မှန်းချက်
                    </CardTitle>
                    <CardDescription className="text-text-dim mt-1">
                      {currentSession.session === 'morning' ? 'မနက်ပိုင်း (12:30 PM Result)' : 'ညနေပိုင်း (05:00 PM Result)'}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-accent-blue/10 text-accent-blue border-accent-blue/30 px-4 py-1 rounded-full text-xs font-bold">
                    {currentSession.session === 'morning' ? 'MORNING' : 'EVENING'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 md:p-12 space-y-10">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="text-xs uppercase tracking-[0.3em] text-text-dim font-bold">
                    NEXT PREDICTION IN
                  </div>
                  <div className="text-5xl md:text-7xl font-mono font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    {getTimeRemaining()}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                  <Button 
                    size="lg" 
                    className="w-full max-w-sm h-16 text-lg font-black rounded-2xl bg-accent-blue text-bg-dark hover:bg-accent-blue/90 shadow-[0_0_30px_rgba(0,209,255,0.3)] transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
                    onClick={handlePredict}
                    disabled={!isPredictionAvailable()}
                  >
                    <RefreshCw className={`mr-3 h-6 w-6 ${!isPredictionAvailable() ? '' : 'animate-spin-slow'}`} />
                    {isPredictionAvailable() ? 'တွက်ချက်မည်' : 'တွက်ချက်ပြီးပါပြီ'}
                  </Button>
                </div>

                <AnimatePresence mode="wait">
                  {predictions.length > 0 && predictions[0].date === format(now, 'yyyy-MM-dd') && predictions[0].session === currentSession.session && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-8 pt-6"
                    >
                      <div className="flex items-center justify-between px-2">
                        <div className="text-xs font-bold text-accent-green flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
                          </span>
                          AI CONFIDENCE: 92.4%
                        </div>
                        <div className="text-[10px] text-text-dim uppercase tracking-widest">
                          Algorithm: Neural-V3
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-3 md:gap-6">
                        {predictions[0].numbers.map((num, idx) => (
                          <div key={idx} className="flex flex-col items-center group">
                            <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-white/10 to-white/0 border border-white/10 text-2xl md:text-4xl font-mono font-black text-accent-blue rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] group-hover:border-accent-blue/50 transition-colors">
                              {num}
                            </div>
                            <div className="mt-3 flex flex-col items-center gap-1">
                              <span className="text-[10px] text-text-dim font-mono tracking-widest">#{idx + 1}</span>
                              <span className="text-[8px] text-accent-green/60 font-bold">{(90 + Math.random() * 8).toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-accent-blue/5 border border-accent-blue/10 rounded-xl p-4 text-[11px] text-text-dim leading-relaxed italic">
                        <span className="text-accent-blue font-bold not-italic mr-1">သတိပြုရန်:</span> 
                        ဤဂဏန်းများသည် AI Algorithm ဖြင့် သင်္ချာနည်းအရ ခန့်မှန်းထားခြင်းသာ ဖြစ်ပါသည်။ ၁၀၀% တိကျမှုကို မည်သူမျှ အာမခံချက် မပေးနိုင်ပါ။ မိမိ၏ ဆုံးဖြတ်ချက်ဖြင့်သာ ကိုးကားအသုံးပြုပါရန်။
                      </div>

                      <div className="flex justify-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-full text-text-dim hover:text-white hover:bg-white/5 px-6"
                          onClick={() => handleCopy(predictions[0].numbers)}
                        >
                          {copied ? <Check className="mr-2 h-4 w-4 text-accent-green" /> : <Copy className="mr-2 h-4 w-4" />}
                          {copied ? 'ကူးယူပြီးပါပြီ' : 'ဂဏန်းအားလုံးကို ကူးယူမည်'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Analysis Section Mockup */}
            <Card className="glass-card border-none rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="text-lg font-bold mb-1">Market Trend Analysis</div>
                <div className="text-sm text-text-dim">အဝယ်နှင့် အရောင်းဈေးကွက် အခြေအနေအရ ခန့်မှန်းချက်</div>
              </div>
              <div className="flex items-end gap-2 h-16">
                {[30, 45, 25, 55, 40, 50, 35, 48].map((h, i) => (
                  <div 
                    key={i} 
                    className={`w-3 rounded-t-sm transition-all duration-500 ${i === 4 ? 'bg-accent-green opacity-100' : 'bg-accent-blue opacity-40'}`}
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar: History */}
          <div className="space-y-8">
            <Card className="glass-card border-none rounded-[32px] h-full flex flex-col">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-lg font-bold flex items-center gap-3">
                  <History className="text-text-dim" size={20} />
                  မှတ်တမ်းဟောင်းများ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="divide-y divide-white/5 max-h-[700px] overflow-y-auto custom-scrollbar">
                  {predictions.length === 0 ? (
                    <div className="p-12 text-center text-text-dim italic text-sm">
                      မှတ်တမ်းမရှိသေးပါ။
                    </div>
                  ) : (
                    predictions.map((p) => (
                      <div key={p.id} className="p-6 hover:bg-white/5 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-sm font-bold group-hover:text-accent-blue transition-colors">{p.date}</div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-text-dim mt-1">
                              {p.session === 'morning' ? 'မနက်ပိုင်း' : 'ညနေပိုင်း'}
                            </div>
                          </div>
                          <div className="text-[10px] font-mono text-text-dim bg-white/5 px-2 py-1 rounded">
                            {format(p.timestamp, 'HH:mm')}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {p.numbers.map((n, i) => (
                            <span key={i} className="px-3 py-1 bg-white/10 text-accent-blue text-xs font-mono font-bold rounded-lg border border-white/5">
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="p-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-text-dim text-[10px] uppercase tracking-widest">
        <span>© 2024 Thailand SET 2D Prediction Engine</span>
        <div className="flex items-center gap-6">
          <span>Server Status: <span className="text-accent-green font-bold">Stable</span></span>
          <span className="hidden sm:inline">Last Update: {format(now, 'HH:mm')}</span>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
