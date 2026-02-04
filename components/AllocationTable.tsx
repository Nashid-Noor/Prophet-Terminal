"use client"

import React from 'react';

interface AllocationTableProps {
    weights: Record<string, number>;
    investmentAmount?: number;
}

export function AllocationTable({ weights, investmentAmount = 0 }: AllocationTableProps) {
    const sortedWeights = Object.entries(weights)
        .sort(([, a], [, b]) => b - a)
        .filter(([, weight]) => weight > 0.01); // Filter small weights

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="space-y-0 text-sm">
            <div className="grid grid-cols-12 text-[10px] uppercase font-mono text-muted-foreground border-b border-border pb-2 mb-2 px-2">
                <div className="col-span-3">Ticker</div>
                <div className="col-span-3 text-right">Weight</div>
                <div className="col-span-6 pl-4 text-right">Amount</div>
            </div>

            {sortedWeights.map(([ticker, weight], index) => (
                <div key={ticker} className="grid grid-cols-12 items-center py-2 px-2 border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <div className="col-span-3 font-mono font-bold text-primary">
                        {ticker}
                    </div>
                    <div className="col-span-3 font-mono text-right text-foreground">
                        {(weight * 100).toFixed(1)}%
                    </div>
                    <div className="col-span-6 pl-4 text-right font-mono text-emerald-500">
                        {investmentAmount > 0 ? formatCurrency(Math.floor(weight * investmentAmount)) : '-'}
                    </div>
                </div>
            ))}

            {investmentAmount > 0 && (
                <div className="grid grid-cols-12 items-center py-2 px-2 border-t border-border mt-2">
                    <div className="col-span-6 font-mono text-xs text-muted-foreground uppercase">Total</div>
                    <div className="col-span-6 text-right font-mono font-bold text-foreground">
                        {formatCurrency(investmentAmount)}
                    </div>
                </div>
            )}
        </div>
    );
}

