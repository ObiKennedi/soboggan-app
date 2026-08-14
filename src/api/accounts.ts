import { apiClient } from './client';
import { Account, AccountType } from '../types';

export async function fetchAccounts() {
  const { data } = await apiClient.get<Account[]>('/accounts');
  return data;
}

export async function fetchAccount(accountId: string) {
  const { data } = await apiClient.get<Account>(`/accounts/${accountId}`);
  return data;
}

export async function createAccount(type: AccountType, currency = 'NGN') {
  const { data } = await apiClient.post<Account>('/accounts', { type, currency });
  return data;
}

export async function withdrawFromAccount(
  accountId: string,
  amount: number,
  description?: string,
  metadata?: Record<string, any>,
) {
  const { data } = await apiClient.post(`/accounts/${accountId}/transactions`, {
    type: 'WITHDRAWAL',
    amount,
    description: description || 'Account withdrawal',
    metadata,
  });
  return data;
}

