import { apiClient } from './client';
import { Loan } from '../types';

export async function fetchMyLoans() {
  const { data } = await apiClient.get<Loan[]>('/loans');
  return data;
}

export async function applyForLoan(principal: number, tenureMonths: number, purpose?: string) {
  const { data } = await apiClient.post<Loan>('/loans', { principal, tenureMonths, purpose });
  return data;
}

export async function repayLoan(loanId: string, amount: number) {
  const { data } = await apiClient.post<Loan>(`/loans/${loanId}/repay`, { amount });
  return data;
}
