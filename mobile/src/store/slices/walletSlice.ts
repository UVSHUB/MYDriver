import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

interface WalletState {
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
}

const initialState: WalletState = {
  balance: 0,
  transactions: [],
  isLoading: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload;
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    deductBalance: (state, action: PayloadAction<number>) => {
      state.balance = Math.max(0, state.balance - action.payload);
    },
    addBalance: (state, action: PayloadAction<number>) => {
      state.balance += action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setBalance, setTransactions, addTransaction, deductBalance, addBalance, setLoading } = walletSlice.actions;
export default walletSlice.reducer;
