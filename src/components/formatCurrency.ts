export function formatCurrency(amount: number | string, currency = 'NGN'): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  const symbol = currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : `${currency} `;
  return `${symbol}${value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
