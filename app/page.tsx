"use client"

import { useEffect, useState } from 'react';
import { endpoints, HistoricalResult, MarketIndex } from '@/lib/api';
import { ForecastChart } from '@/components/ForecastChart';
import { AllocationPie } from '@/components/AllocationPie';
import { AllocationTable } from '@/components/AllocationTable';
import { TickerManager } from '@/components/TickerManager';
import { Sidebar } from '@/components/Sidebar';
import { ModelConfig, ModelConfigState, DEFAULT_CONFIG } from '@/components/ModelConfig';
import { HelpModal } from '@/components/HelpModal';
import { Loader2, TrendingUp, TrendingDown, RefreshCw, Terminal, Wallet, HelpCircle } from 'lucide-react';

import { AccuracyMatrix } from '@/components/AccuracyMatrix';

export default function Dashboard() {
  const [data, setData] = useState<HistoricalResult[]>([]);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  // Model Config State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [modelConfig, setModelConfig] = useState<ModelConfigState>(DEFAULT_CONFIG);

  const [investmentAmount, setInvestmentAmount] = useState<number>(100000);

  const [tickers, setTickers] = useState<string[]>([
    "AMD", "MSFT", "AAPL", "TSLA", "AMZN",
    "NVDA", "META", "GOOG", "TSM", "JPM", "NFLX", "PLTR"
  ]);

  const [isSystemOnline, setIsSystemOnline] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      const health = await endpoints.getHealth();
      setIsSystemOnline(health.status !== 'offline');
    };

    checkHealth(); // Check immediately
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [histRes, indieRes] = await Promise.all([
        endpoints.getAllHistorical(),
        endpoints.getMarketIndices()
      ]);
      setData(histRes);
      setIndices(indieRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOptimize = async () => {
    try {
      setOptimizing(true);

      // Transform local config to API payload structure
      const apiConfig = {
        risk_aversion: modelConfig.riskAversion,
        min_allocation: modelConfig.minAllocation,
        // max allocation left as default or could be added to UI
        prophet_params: {
          yearly_seasonality: modelConfig.yearlySeasonality,
          weekly_seasonality: modelConfig.weeklySeasonality
        }
      };

      await endpoints.runOptimization(tickers, apiConfig);
      await fetchData();
    } catch (e) {
      alert("Optimization failed: " + e);
    } finally {
      setOptimizing(false);
    }
  };

  const addTicker = (t: string) => {
    if (!tickers.includes(t)) setTickers([...tickers, t]);
  };

  const removeTicker = (t: string) => {
    setTickers(tickers.filter(x => x !== t));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      <Sidebar onConfigClick={() => setIsConfigOpen(true)} />

      <ModelConfig
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={modelConfig}
        onSave={setModelConfig}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <main className="flex-1 pl-16 md:pl-64 flex flex-col min-h-screen transition-all duration-300">
        {/* Terminal Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${isSystemOnline ? 'text-muted-foreground' : 'text-destructive'}`}>
              <Terminal className="w-4 h-4 mr-2" />
              <span className="text-xs font-mono">SYS.STATUS: {isSystemOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
            <div className="h-4 w-[1px] bg-border"></div>
            <span className={`text-xs font-mono animate-pulse ${isSystemOnline ? 'text-primary' : 'text-destructive'}`}>
              ● LIVE FEED
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="text-muted-foreground hover:text-primary transition-colors p-2"
              title="System Manual"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <button
              onClick={handleOptimize}
              disabled={optimizing}
              className={`
                flex items-center px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all
                border border-primary text-primary hover:bg-primary hover:text-primary-foreground
                ${optimizing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {optimizing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  PROCESSING...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-2" />
                  RUN_OPTIMIZATION.EXE
                </>
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {loading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="font-mono text-sm text-muted-foreground animate-pulse">Initializing data stream...</p>
            </div>
          ) : (
            <>
              {/* Top Row: Sparklines / Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {indices.length > 0 ? indices.map((metric) => (
                  <div key={metric.label} className="bg-card border border-border p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      {metric.up ? <TrendingUp className="w-12 h-12" /> : <TrendingDown className="w-12 h-12" />}
                    </div>
                    <p className="text-xs font-mono text-muted-foreground mb-1">{metric.label}</p>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-mono font-bold tracking-tight">{metric.value}</span>
                      <span className={`text-xs font-mono font-bold ${metric.up ? 'text-primary' : 'text-destructive'}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                )) : (
                  // Fallback loading state for indices if empty
                  [1, 2, 3].map(i => (
                    <div key={i} className="bg-card border border-border p-4 animate-pulse h-[100px]"></div>
                  ))
                )}

                {/* Investment Amount Input */}
                <div className="bg-card border border-border p-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Wallet className="w-12 h-12" />
                  </div>
                  <p className="text-xs font-mono text-muted-foreground mb-1">TOTAL CAPITAL</p>
                  <div className="flex items-center">
                    <span className="text-xl font-mono text-muted-foreground mr-1">₹</span>
                    <input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                      className="bg-transparent text-2xl font-mono font-bold tracking-tight w-full focus:outline-none border-b border-dashed border-muted-foreground/50 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">

                {/* Row 1: Forecast Chart + Accuracy Matrix */}
                <div className="lg:col-span-8 h-[450px]">
                  <ForecastChart data={data} />
                </div>

                <div className="lg:col-span-4 h-[450px]">
                  <AccuracyMatrix />
                </div>

                {/* Row 2: Three Column Widget Row */}

                {/* Col 1: Allocation Pie */}
                <div className="lg:col-span-4 h-[400px]">
                  <AllocationPie data={data} />
                </div>

                {/* Col 2: Allocation Table */}
                <div className="lg:col-span-4 h-[400px] bg-card border border-border flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-border bg-secondary/30 flex justify-between items-center">
                    <h3 className="font-mono text-xs font-bold uppercase text-muted-foreground">Allocation_Table</h3>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    <AllocationTable
                      investmentAmount={investmentAmount}
                      weights={
                        (() => {
                          if (!data || data.length === 0) return {};
                          const grouped: Record<string, any[]> = {};
                          data.forEach(d => {
                            if (!grouped[d.date]) grouped[d.date] = [];
                            grouped[d.date].push(d);
                          });
                          const sortedDates = Object.keys(grouped).sort().reverse();
                          const latestItems = grouped[sortedDates[0]] || [];
                          const weights: Record<string, number> = {};
                          latestItems.forEach(item => {
                            weights[item.ticker] = item.weight;
                          });
                          return weights;
                        })()
                      } />
                  </div>
                </div>

                {/* Col 3: Ticker Config */}
                <div className="lg:col-span-4 h-[400px] bg-card border border-border p-4 flex flex-col">
                  <h3 className="font-mono text-xs font-bold uppercase text-muted-foreground mb-4">Ticker_Config</h3>
                  <div className="flex-1">
                    <TickerManager
                      tickers={tickers}
                      onAdd={addTicker}
                      onRemove={removeTicker}
                      disabled={optimizing}
                    />
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
