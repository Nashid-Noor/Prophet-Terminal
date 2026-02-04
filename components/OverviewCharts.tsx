"use client"

import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { HistoricalResult } from '@/lib/api';

const COLORS = ['#10B981', '#3B82F6', '#EC4899', '#F59E0B', '#8B5CF6', '#6366F1', '#14B8A6', '#F43F5E'];

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border p-3 text-xs shadow-xl">
                <p className="mb-2 font-mono font-bold text-popover-foreground border-b border-border pb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4 mb-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5" style={{ backgroundColor: entry.stroke || entry.fill }} />
                            <span className="text-muted-foreground font-mono uppercase">{entry.name}:</span>
                        </div>
                        <span className="font-mono text-foreground font-bold tabular-nums">
                            {entry.value !== undefined ? (typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value) : ''}
                            {/* Heuristic for percentage vs price */}
                            {entry.name && !['AMD', 'GOOG', 'PLTR', 'MSFT', 'AAPL', 'TSLA'].some(t => entry.name.includes(t)) ? '%' : ''}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

interface OverviewChartsProps {
    data: HistoricalResult[];
}

export function OverviewCharts({ data }: OverviewChartsProps) {
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

    const pieData = uniqueItems.map(item => ({
        name: item.ticker,
        value: item.weight
    })).filter(i => i.value > 0.01);

    const lineData = sortedDates.map(date => {
        const items = groupedByDate[date];
        const point: any = { date };
        items.forEach(item => {
            point[item.ticker] = item.predicted_price;
        });
        return point;
    }).reverse();

    const tickers = uniqueItems.map(i => i.ticker);

    return (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 h-full">
            {/* Forecast Chart */}
            <div className="bg-card border border-border flex flex-col min-h-[400px]">
                <div className="p-3 border-b border-border bg-secondary/30 flex justify-between items-center">
                    <h3 className="font-mono text-xs font-bold uppercase text-muted-foreground">Forecast_History</h3>
                </div>
                <div className="flex-1 p-4 min-h-[300px]">
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

            {/* Allocation Chart */}
            <div className="bg-card border border-border flex flex-col min-h-[400px]">
                <div className="p-3 border-b border-border bg-secondary/30 flex justify-between items-center">
                    <h3 className="font-mono text-xs font-bold uppercase text-muted-foreground">Current_Allocation</h3>
                </div>
                <div className="flex-1 p-4 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                iconType="square"
                                iconSize={8}
                                wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }}
                                formatter={(value) => <span className="text-muted-foreground ml-1">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

