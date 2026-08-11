import { apiClient } from './client';
import { Transaction, ActivityLogEntry } from '../types';

export async function fetchAccountTransactions(accountId: string, take = 50, skip = 0) {
  const { data } = await apiClient.get<Transaction[]>(
    `/accounts/${accountId}/transactions`,
    { params: { take, skip } },
  );
  return data;
}

export async function fetchAllTransactions(take = 50, skip = 0) {
  const { data } = await apiClient.get<Transaction[]>('/transactions', {
    params: { take, skip },
  });
  return data;
}

export async function fetchActivityLog(take = 50, skip = 0) {
  const { data } = await apiClient.get<ActivityLogEntry[]>('/activity-logs', {
    params: { take, skip },
  });
  return data;
}
