"use client"

import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { HistoricalResult } from '@/lib/api';

const COLORS = ['#10B981', '#3B82F6', '#EC4899', '#F59E0B', '#8B5CF6', '#6366F1', '#14B8A6', '#F43F5E'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border p-3 text-xs shadow-xl">
                <p className="mb-2 font-mono font-bold text-popover-foreground border-b border-border pb-1">{label}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5" style={{ backgroundColor: entry.stroke || entry.fill }} />
                                <span className="text-muted-foreground font-mono uppercase">{entry.name}:</span>
                            </div>
                            <span className="font-mono text-foreground font-bold tabular-nums">
                                {entry.value !== undefined ? (typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value) : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

interface ForecastChartProps {
    data: HistoricalResult[];
}

export function ForecastChart({ data }: ForecastChartProps) {
    const groupedByDate: Record<string, HistoricalResult[]> = {};
    if (data) {
        data.forEach(item => {
            const d = item.date;
            if (!groupedByDate[d]) groupedByDate[d] = [];
            groupedByDate[d].push(item);
        });
    }

    const sortedDates = Object.keys(groupedByDate).sort().reverse();
    const latestItems = sortedDates.length > 0 ? groupedByDate[sortedDates[0]] : [];

    const uniqueItemsMap = new Map();
    latestItems.forEach(item => {
        uniqueItemsMap.set(item.ticker, item);
    });
    const uniqueItems = Array.from(uniqueItemsMap.values());
    const tickers = uniqueItems.map(i => i.ticker);

    const lineData = sortedDates.map(date => {
        const items = groupedByDate[date];
        const point: any = { date };
        items.forEach(item => {
            point[item.ticker] = item.predicted_price;
        });
        return point;
    }).reverse();

    return (
        <div className="bg-card border border-border flex flex-col h-full min-h-[400px]">
            <div className="p-3 border-b border-border bg-secondary/30 flex justify-between items-center">
                <h3 className="font-mono text-xs font-bold uppercase text-muted-foreground">Forecast_History</h3>
            </div>
            <div className="flex-1 p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                        <XAxis
                            dataKey="date"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#6B7280', fontFamily: 'monospace' }}
                            dy={10}
                            minTickGap={30}
                        />
                        <YAxis
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                            tick={{ fill: '#6B7280', fontFamily: 'monospace' }}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#374151', strokeWidth: 1 }} />
                        {tickers.map((ticker, index) => (
                            <Line
                                key={ticker}
                                type="stepAfter"
                                dataKey={ticker}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={1.5}
                                dot={false}
                                activeDot={{ r: 4, stroke: '#fff', strokeWidth: 1 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
