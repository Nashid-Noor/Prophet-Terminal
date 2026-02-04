"use client"

import React from 'react';
import {
    PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer
} from 'recharts';
import { HistoricalResult } from '@/lib/api';

const COLORS = ['#10B981', '#3B82F6', '#EC4899', '#F59E0B', '#8B5CF6', '#6366F1', '#14B8A6', '#F43F5E'];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border p-2 text-xs shadow-xl">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.fill }} />
                    <span className="font-mono text-foreground font-bold">
                        {payload[0].name}: {(payload[0].value * 100).toFixed(1)}%
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

interface AllocationPieProps {
    data: HistoricalResult[];
}

export function AllocationPie({ data }: AllocationPieProps) {
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

    // Deduplicate items by ticker
    const uniqueItemsMap = new Map();
    latestItems.forEach(item => {
        uniqueItemsMap.set(item.ticker, item);
    });
    const uniqueItems = Array.from(uniqueItemsMap.values());

    const pieData = uniqueItems.map(item => ({
        name: item.ticker,
        value: item.weight
    })).filter(i => i.value > 0.01);

    return (
        <div className="bg-card border border-border flex flex-col h-full min-h-[300px]">
            <div className="p-3 border-b border-border bg-secondary/30 flex justify-between items-center">
                <h3 className="font-mono text-xs font-bold uppercase text-muted-foreground">Current_Allocation</h3>
            </div>
            <div className="flex-1 p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
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
                            wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px' }}
                            formatter={(value) => <span className="text-muted-foreground ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
