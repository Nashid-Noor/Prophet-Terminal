"use client"

import React, { useState } from 'react';
import { Plus, X, Search, ChevronRight } from 'lucide-react';

interface TickerManagerProps {
    tickers: string[];
    onAdd: (ticker: string) => void;
    onRemove: (ticker: string) => void;
    disabled?: boolean;
}

export function TickerManager({ tickers, onAdd, onRemove, disabled }: TickerManagerProps) {
    const [input, setInput] = useState("");

    const handleAdd = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (input && !tickers.includes(input.toUpperCase())) {
            onAdd(input.toUpperCase());
            setInput("");
        }
    };

    return (
        <div className="space-y-4">
            {/* Input */}
            <form onSubmit={handleAdd} className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value.toUpperCase())}
                    placeholder="ADD_ASSET..."
                    disabled={disabled}
                    className="w-full bg-background border border-border py-2 pl-9 pr-4 text-xs font-mono text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-0 transition-all uppercase"
                />
                <button
                    type="submit"
                    disabled={!input || disabled}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-none text-muted-foreground disabled:opacity-0 disabled:pointer-events-none transition-all duration-300"
                >
                    <ChevronRight className="w-3 h-3" />
                </button>
            </form>

            {/* List */}
            <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
                {tickers.map(ticker => (
                    <div
                        key={ticker}
                        className="group flex items-center justify-between px-3 py-2 bg-secondary/20 border border-transparent hover:border-border hover:bg-secondary/40 transition-all font-mono"
                    >
                        <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-primary/50 group-hover:bg-primary"></div>
                            <span className="text-xs font-bold text-foreground">{ticker}</span>
                        </div>
                        <button
                            onClick={() => onRemove(ticker)}
                            disabled={disabled}
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="pt-2 border-t border-border flex justify-between text-[10px] font-mono text-muted-foreground uppercase">
                <span>Total_Assets</span>
                <span>{tickers.length}</span>
            </div>
        </div>
    );
}

