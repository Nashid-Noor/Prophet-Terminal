"use client"

import React, { useState } from 'react';
import { Settings, X, Save, RotateCcw } from 'lucide-react';

export interface ModelConfigState {
    riskAversion: number; // 1-10
    minAllocation: number; // 0.0 - 0.2
    yearlySeasonality: boolean;
    weeklySeasonality: boolean;
}

export const DEFAULT_CONFIG: ModelConfigState = {
    riskAversion: 5,
    minAllocation: 0.05,
    yearlySeasonality: true,
    weeklySeasonality: true,
};

interface ModelConfigProps {
    isOpen: boolean;
    onClose: () => void;
    config: ModelConfigState;
    onSave: (newConfig: ModelConfigState) => void;
}

export function ModelConfig({ isOpen, onClose, config, onSave }: ModelConfigProps) {
    const [localConfig, setLocalConfig] = useState<ModelConfigState>(config);

    // Sync local state when prop changes
    React.useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(localConfig);
        onClose();
    };

    const handleReset = () => {
        setLocalConfig(DEFAULT_CONFIG);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative w-full max-w-md h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-secondary/20">
                    <div className="flex items-center space-x-2">
                        <Settings className="w-5 h-5 text-primary" />
                        <h2 className="font-mono font-bold text-lg">Model_Configuration</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Risk Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-mono text-sm font-bold uppercase text-primary">Risk_Tolerance</h3>
                            <span className="font-mono text-xs text-muted-foreground">MARKOWITZ_LAMBDA</span>
                        </div>

                        <div className="bg-secondary/20 p-4 border border-border space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium">Risk Aversion Level</label>
                                    <span className="font-mono font-bold text-primary">{localConfig.riskAversion}</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="1"
                                    value={localConfig.riskAversion}
                                    onChange={(e) => setLocalConfig({ ...localConfig, riskAversion: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                                    <span>AGGRESSIVE (1)</span>
                                    <span>CONSERVATIVE (10)</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-border/50">
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium">Min Allocation Per Asset</label>
                                    <span className="font-mono font-bold text-primary">{(localConfig.minAllocation * 100).toFixed(0)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="0.2"
                                    step="0.01"
                                    value={localConfig.minAllocation}
                                    onChange={(e) => setLocalConfig({ ...localConfig, minAllocation: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seasonality Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-mono text-sm font-bold uppercase text-primary">Prophet_Seasonality</h3>
                            <span className="font-mono text-xs text-muted-foreground">TIME_SERIES_PARAMS</span>
                        </div>

                        <div className="bg-secondary/20 p-4 border border-border space-y-3">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm group-hover:text-white transition-colors">Yearly Seasonality</span>
                                <input
                                    type="checkbox"
                                    checked={localConfig.yearlySeasonality}
                                    onChange={(e) => setLocalConfig({ ...localConfig, yearlySeasonality: e.target.checked })}
                                    className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary"
                                />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm group-hover:text-white transition-colors">Weekly Seasonality</span>
                                <input
                                    type="checkbox"
                                    checked={localConfig.weeklySeasonality}
                                    onChange={(e) => setLocalConfig({ ...localConfig, weeklySeasonality: e.target.checked })}
                                    className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-primary"
                                />
                            </label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Disable seasonality to make the model react faster to recent trends, or enable it to account for recurring cycles.
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <div className="h-20 border-t border-border bg-secondary/10 px-6 flex items-center justify-between">
                    <button
                        onClick={handleReset}
                        className="flex items-center text-xs font-mono text-muted-foreground hover:text-white transition-colors"
                    >
                        <RotateCcw className="w-3 h-3 mr-2" />
                        RESET_DEFAULTS
                    </button>

                    <button
                        onClick={handleSave}
                        className="flex items-center bg-primary hover:bg-emerald-400 text-primary-foreground px-6 py-2  font-mono text-sm font-bold uppercase tracking-wider transition-all"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save & Apply
                    </button>
                </div>

            </div>
        </div>
    );
}
