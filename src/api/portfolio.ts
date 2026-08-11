import { apiClient } from './client';
import { Portfolio, Asset } from '../types';

export async function fetchPortfolio(accountId: string) {
  const { data } = await apiClient.get<Portfolio>(`/accounts/${accountId}/portfolio`);
  return data;
}

export async function fetchAssets() {
  const { data } = await apiClient.get<Asset[]>('/assets');
  return data;
}
