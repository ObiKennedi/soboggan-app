import { apiClient } from './client';

export interface InitializePaymentResponse {
  paymentId: string;
  reference: string;
  authorizationUrl: string;
}

export async function initializePayment(accountId: string, amount: number) {
  const { data } = await apiClient.post<InitializePaymentResponse>('/payments/initialize', {
    accountId,
    amount,
  });
  return data;
}

export async function verifyPayment(reference: string) {
  const { data } = await apiClient.post(`/payments/verify/${reference}`);
  return data;
}
