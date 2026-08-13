import { apiClient } from './client';
import {
  AssetCategory,
  BuyInstruction,
  CryptoQuote,
  InvestmentLogEntry,
  InvestmentOverview,
  RealEstateListing,
  SellInstruction,
  StockQuote,
} from '../types';

/** NGX stock listings */
export async function fetchAvailableStocks() {
  const { data } = await apiClient.get<StockQuote[]>('/investments/stocks');
  return data;
}

/** Live crypto prices from Coinbase (via our API) */
export async function fetchAvailableCrypto() {
  const { data } = await apiClient.get<CryptoQuote[]>('/investments/crypto');
  return data;
}

/** Active real estate listings */
export async function fetchRealEstateListings() {
  const { data } = await apiClient.get<RealEstateListing[]>('/investments/real-estate');
  return data;
}

export async function createBuyInstruction(payload: {
  assetCategory: AssetCategory;
  stockSymbol: string;
  stockName: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
  listingId?: string;
}) {
  const { data } = await apiClient.post<BuyInstruction>('/investments/buy-instructions', payload);
  return data;
}

export async function fetchBuyInstructions() {
  const { data } = await apiClient.get<BuyInstruction[]>('/investments/buy-instructions');
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
