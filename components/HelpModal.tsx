"use client"

import React from 'react';
import { X, Terminal, ChevronRight } from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-card border border-primary/50 shadow-2xl shadow-primary/10 relative overflow-hidden">
                {/* Header */}
                <div className="bg-primary/10 border-b border-primary/20 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-primary">
                        <Terminal className="w-5 h-5" />
                        <h2 className="font-mono text-sm font-bold tracking-wider uppercase">System_Manual_v1.0</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-primary/70 hover:text-primary transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 font-mono text-sm">
                    {/* Section 1 */}
                    <div className="space-y-2">
                        <h3 className="text-primary font-bold flex items-center">
                            <span className="mr-2">01.</span>
                            INITIALIZATION_PROTOCOL
                        </h3>
                        <div className="pl-6 border-l border-primary/20 space-y-2 text-muted-foreground">
                            <p>To begin analysis, input asset tickers in the <span className="text-foreground font-bold">TICKER_CONFIG</span> module (Bottom Right).</p>
                            <div className="bg-secondary/50 p-3 text-xs border border-border mt-2">
                                <p className="text-primary mb-1">IMPORTANT_NOTE:</p>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>For US Stocks: Use symbol directly (e.g., <span className="text-foreground">AAPL</span>)</li>
                                    <li>For Indian Stocks: Append .NS (e.g., <span className="text-foreground">TCS.NS</span>, <span className="text-foreground">INFY.NS</span>)</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-2">
                        <h3 className="text-primary font-bold flex items-center">
                            <span className="mr-2">02.</span>
                            EXECUTION_SEQUENCE
                        </h3>
                        <div className="pl-6 border-l border-primary/20 space-y-2 text-muted-foreground">
                            <p>Once assets are configured, modify risk parameters in <span className="text-foreground font-bold">MODEL_CONFIG</span> (Sidebar) if required.</p>
                            <p className="flex items-center gap-2">
                                Initate process by engaging the
                                <span className="border border-primary text-primary px-1.5 py-0.5 text-[10px] bg-primary/10">RUN_OPTIMIZATION.EXE</span>
                                command in the top header.
                            </p>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-2">
                        <h3 className="text-primary font-bold flex items-center">
                            <span className="mr-2">03.</span>
                            DATA_INTERPRETATION
                        </h3>
                        <div className="pl-6 border-l border-primary/20 space-y-2 text-muted-foreground">
                            <p>Results will stream to the main dashboard:</p>
                            <ul className="space-y-1">
                                <li className="flex items-center gap-2">
                                    <ChevronRight className="w-3 h-3 text-primary" />
                                    <span><span className="text-foreground font-bold">ALLOCATION_TABLE</span>: Recommended portfolio weights.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <ChevronRight className="w-3 h-3 text-primary" />
                                    <span><span className="text-foreground font-bold">FORECAST_CHART</span>: 1-Day forward price predictions.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <ChevronRight className="w-3 h-3 text-primary" />
                                    <span><span className="text-foreground font-bold">ACCURACY_MATRIX</span>: Validation of past predictions vs actuals.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-secondary/30 border-t border-border p-3 text-[10px] text-muted-foreground font-mono text-center uppercase">
                    Prophet Terminal // Advanced Analytics Module
                </div>
            </div>
        </div>
    );
}
