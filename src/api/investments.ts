import { apiClient } from './client';
import { InvestmentLogEntry, InvestmentOverview, SellInstruction, StockQuote, BuyInstruction } from '../types';

export async function fetchAvailableStocks() {
  const { data } = await apiClient.get<StockQuote[]>('/investments/stocks');
  return data;
}

export async function createBuyInstruction(payload: {
  stockSymbol: string;
  stockName: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
}) {
  const { data } = await apiClient.post<BuyInstruction>('/investments/buy-instructions', payload);
  return data;
}

export async function fetchInvestmentOverview() {
  const { data } = await apiClient.get<InvestmentOverview>('/investments/overview');
  return data;
}

export async function fetchInvestmentLogs() {
  const { data } = await apiClient.get<InvestmentLogEntry[]>('/investments/logs');
  return data;
}

export async function fetchSellInstructions() {
  const { data } = await apiClient.get<SellInstruction[]>('/investments/sell-instructions');
  return data;
}

export async function createSellInstruction(payload: {
  assetSymbol: string;
  assetName: string;
  quantity: number;
  targetPrice?: number;
  notes?: string;
}) {
  const { data } = await apiClient.post<SellInstruction>('/investments/sell-instructions', payload);
  return data;
}
