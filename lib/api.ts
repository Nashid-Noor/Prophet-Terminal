import axios from 'axios';

// In Next.js (client-side), relative path /api uses the proxy in dev or same domain in prod.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface OptimisationResult {
    date: string;
    weights: Record<string, number>;
}

export interface HistoricalResult {
    ticker: string;
    date: string;
    predicted_price: number;
    predicted_return: number;
    weight: number;
    actual_history: number[];
}

export interface ProphetParams {
    yearly_seasonality?: boolean;
    weekly_seasonality?: boolean;
    daily_seasonality?: boolean;
}

export interface OptimizationConfig {
    risk_aversion?: number;
    min_allocation?: number;
    max_allocation?: number;
    prophet_params?: ProphetParams;
}

export const endpoints = {
    runOptimization: async (tickers?: string[], config?: OptimizationConfig): Promise<OptimisationResult> => {
        const payload: any = { ...config };
        if (tickers && tickers.length > 0) {
            payload.tickers = tickers;
        }

        const response = await api.post('/api/optimization/run', payload);
        return response.data.data;
    },

    getLatestHistorical: async (): Promise<HistoricalResult[]> => {
        const response = await api.get('/api/historical/latest');
        return response.data;
    },

    getAllHistorical: async (): Promise<HistoricalResult[]> => {
        const response = await api.get('/api/historical/all');
        return response.data;
    },

    getMarketStatus: async (): Promise<Array<{ isOpen: boolean; exchange: string; timestamp: string }>> => {
        const response = await api.get('/api/market/status');
        return response.data;
    },

    async getAccuracyData(): Promise<AccuracyMetric[]> {
        const response = await api.get('/api/accuracy/');
        return response.data;
    },

    async getMarketIndices(): Promise<MarketIndex[]> {
        const response = await api.get('/api/market/indices');
        return response.data;
    },

    async getHealth(): Promise<{ status: string }> {
        try {
            const response = await api.get('/api/health');
            return response.data;
        } catch (e) {
            return { status: 'offline' };
        }
    }
};

export interface AccuracyMetric {
    ticker: string;
    predicted_price: number;
    actual_price: number;
    accuracy: number;
    date: string;
}

export interface MarketIndex {
    label: string;
    value: string;
    change: string;
    up: boolean;
}
