export type AccountType = 'SAVINGS' | 'INVESTMENT' | 'LOAN' | 'FIXED_DEPOSIT';
export type AccountStatus = 'ACTIVE' | 'DORMANT' | 'FROZEN' | 'CLOSED';

export interface Account {
  id: string;
  accountNumber: string;
  type: AccountType;
  status: AccountStatus;
  currency: string;
  balance: string; // Prisma Decimal serializes as string over JSON
  createdAt: string;
}

export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'BUY'
  | 'SELL'
  | 'INTEREST'
  | 'FEE'
  | 'DIVIDEND'
  | 'LOAN_DISBURSEMENT'
  | 'LOAN_REPAYMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVERSED';

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  currency: string;
  reference: string;
  description?: string | null;
  createdAt: string;
  account?: { accountNumber: string; type: AccountType };
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: string;
  currency: string;
  currentPrice: string;
}

export interface Holding {
  id: string;
  assetId: string;
  quantity: string;
  averageCost: string;
  asset: Asset;
  marketValue: number;
  unrealizedPnL: number;
}

export interface Portfolio {
  id: string;
  accountId: string;
  name: string;
  currency: string;
  totalValue: number;
  holdings: Holding[];
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
}

export type NotificationType =
  | 'TRANSACTION'
  | 'PORTFOLIO_UPDATE'
  | 'LOAN_UPDATE'
  | 'SECURITY'
  | 'SYSTEM'
  | 'MARKETING';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
}

export type LoanStatus =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISBURSED'
  | 'REPAYING'
  | 'CLOSED'
  | 'DEFAULTED';

export interface Loan {
  id: string;
  accountId: string;
  principal: string;
  interestRate: string;
  tenureMonths: number;
  outstandingBalance: string;
  status: LoanStatus;
  purpose?: string | null;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  emailVerified?: boolean;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  role: 'CLIENT' | 'ADVISOR' | 'ADMIN';
  kycStatus: 'PENDING' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED';
}

export type SellInstructionStatus = 'PENDING' | 'IN_REVIEW' | 'EXECUTED' | 'REJECTED' | 'CANCELLED';

export interface SellInstruction {
  id: string;
  userId: string;
  assetSymbol: string;
  assetName: string;
  quantity: string | number;
  targetPrice?: string | number | null;
  notes?: string | null;
  status: SellInstructionStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface InvestmentLogEntry {
  id: string;
  type: 'TRANSACTION' | 'SELL_INSTRUCTION';
  title: string;
  description: string;
  amount?: number | null;
  currency: string;
  timestamp: string;
  status: string;
  meta?: Record<string, any>;
}

export interface InvestmentOverview {
  totalValue: number;
  totalHoldingsCount: number;
  activeInstructionsCount: number;
  holdings: Array<{
    id: string;
    symbol: string;
    name: string;
    assetType: string;
    quantity: number;
    averageCost: number;
    currentPrice: number;
    marketValue: number;
    unrealizedPnL: number;
  }>;
}


