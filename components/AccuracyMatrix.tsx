"use client"

import React, { useEffect, useState } from 'react';
import { endpoints, AccuracyMetric } from '@/lib/api';
import { CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';

export function AccuracyMatrix() {
    const [metrics, setMetrics] = useState<AccuracyMetric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccuracy = async () => {
            try {
                const data = await endpoints.getAccuracyData();
                setMetrics(data);
            } catch (e) {
                console.error("Failed to load accuracy metrics", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAccuracy();
    }, []);

    const getScoreColor = (score: number) => {
        if (score >= 95) return 'text-emerald-500';
        if (score >= 90) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getProgressBarColor = (score: number) => {
        if (score >= 95) return 'bg-emerald-500';
        if (score >= 90) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    if (loading) {
        return (
            <div className="bg-card border border-border flex flex-col h-full min-h-[300px] items-center justify-center">
                <p className="text-xs font-mono text-muted-foreground animate-pulse">CALCULATING_ACCURACY...</p>
            </div>
        );
    }

    if (!metrics || metrics.length === 0) {
        return (
            <div className="bg-card border border-border flex flex-col h-full items-center justify-center p-6 text-center">
                <HelpCircle className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-mono font-bold text-muted-foreground">NO_DATA_AVAILABLE</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Accuracy requires at past predictions to compare against real market data.
                </p>
            </div>
        );
    }

    // Sort by Accuracy Descending (Best first)
    const sortedMetrics = [...metrics].sort((a, b) => b.accuracy - a.accuracy);

    return (
        <div className="bg-card border border-border flex flex-col h-full overflow-hidden">
            <div className="p-3 border-b border-border bg-secondary/30 flex justify-between items-center">
                <h3 className="font-mono text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    Accuracy_Matrix <span className="px-1.5 py-0.5 rounded-sm bg-background border border-border text-[9px]">30D</span>
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-border/50">
                    <div className="grid grid-cols-12 px-3 py-2 bg-secondary/10 text-[10px] uppercase font-mono text-muted-foreground sticky top-0 backdrop-blur-sm z-10">
                        <div className="col-span-2">Ticker</div>
                        <div className="col-span-3 text-right">Pred</div>
                        <div className="col-span-3 text-right">Act</div>
                        <div className="col-span-4 text-right pr-2">Score</div>
                    </div>

                    {sortedMetrics.map((m) => (
                        <div key={m.ticker} className="grid grid-cols-12 items-center px-3 py-2 hover:bg-secondary/20 transition-colors text-xs">
                            {/* Ticker */}
                            <div className="col-span-2 font-mono font-bold text-primary">
                                {m.ticker}
                            </div>

                            {/* Predicted Price */}
                            <div className="col-span-3 font-mono text-right text-muted-foreground">
                                {m.predicted_price.toFixed(1)}
                            </div>

                            {/* Actual Price */}
                            <div className="col-span-3 font-mono text-right text-foreground">
                                {m.actual_price.toFixed(1)}
                            </div>

                            {/* Score & Bar */}
                            <div className="col-span-4 flex items-center justify-end gap-2 pl-2">
                                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden min-w-[30px]">
                                    <div
                                        className={`h-full ${getProgressBarColor(m.accuracy)} transition-all duration-500`}
                                        style={{ width: `${Math.min(100, m.accuracy)}%` }}
                                    />
                                </div>
                                <div className={`font-mono font-bold min-w-[36px] text-right ${getScoreColor(m.accuracy)}`}>
                                    {m.accuracy.toFixed(1)}%
                                </div>
                                {m.accuracy >= 95 ? (
                                    <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                                ) : m.accuracy >= 90 ? (
                                    <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0" />
                                ) : (
                                    <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
