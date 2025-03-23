import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

// Define types for our data models
export interface Card {
  id: string;
  name: string;
  issuer: string;
  lastFourDigits: string;
  cashbackRate: number;
  type: 'credit' | 'debit';
  color: string;
  balance?: number; // Optional for debit cards
  limit?: number; // Optional for credit cards
  expiryDate: string;
  categories: string[]; // Categories where this card offers cashback
}

export interface Transaction {
  id: string;
  cardId: string;
  amount: number;
  merchant: string;
  date: Date;
  category: string;
  cashbackAmount: number;
}

export interface Suggestion {
  id: string;
  cardId: string;
  reason: string;
  category: string;
  potentialSavings: number;
}

// Define the context state
interface WalletState {
  cards: Card[];
  transactions: Transaction[];
  suggestions: Suggestion[];
  filteredCards: Card[];
  selectedCard: Card | null;
  isLoading: boolean;
}

// Define the context value interface
interface WalletContextValue extends WalletState {
  addCard: (card: Omit<Card, 'id'>) => void;
  removeCard: (id: string) => void;
  selectCard: (id: string) => void;
  filterCards: (type?: 'credit' | 'debit' | 'all') => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'cashbackAmount'>) => void;
  processPayment: (amount: number, merchant: string, category: string, cardId?: string) => Promise<boolean>;
  getBestCardForCategory: (category: string) => Card | null;
}

// Create the context
const WalletContext = createContext<WalletContextValue | undefined>(undefined);

// Sample data for initial state
const sampleCards: Card[] = [
  {
    id: '1',
    name: 'Blue Cash Preferred',
    issuer: 'American Express',
    lastFourDigits: '1234',
    cashbackRate: 6,
    type: 'credit',
    color: '#2979FF',
    limit: 10000,
    expiryDate: '12/25',
    categories: ['groceries', 'streaming', 'transit'],
  },
  {
    id: '2',
    name: 'Chase Freedom Unlimited',
    issuer: 'Chase',
    lastFourDigits: '5678',
    cashbackRate: 1.5,
    type: 'credit',
    color: '#00C853',
    limit: 5000,
    expiryDate: '09/24',
    categories: ['dining', 'drugstores', 'travel'],
  },
  {
    id: '3',
    name: 'Citi Double Cash',
    issuer: 'Citibank',
    lastFourDigits: '9012',
    cashbackRate: 2,
    type: 'credit',
    color: '#FF6D00',
    limit: 7500,
    expiryDate: '03/26',
    categories: ['general'],
  },
  {
    id: '4',
    name: 'Checking Account',
    issuer: 'Bank of America',
    lastFourDigits: '3456',
    cashbackRate: 0,
    type: 'debit',
    color: '#D50000',
    balance: 2500,
    expiryDate: '05/27',
    categories: [],
  },
];

// Provider component
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WalletState>({
    cards: sampleCards,
    transactions: [],
    suggestions: [],
    filteredCards: sampleCards,
    selectedCard: null,
    isLoading: false,
  });

  // Generate suggestions based on transaction history
  useEffect(() => {
    if (state.transactions.length > 0) {
      // Group transactions by category
      const categorySpending: Record<string, number> = {};
      state.transactions.forEach(transaction => {
        if (!categorySpending[transaction.category]) {
          categorySpending[transaction.category] = 0;
        }
        categorySpending[transaction.category] += transaction.amount;
      });

      // Find top spending categories
      const topCategories = Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

      // Generate suggestions for each top category
      const newSuggestions: Suggestion[] = [];

      topCategories.forEach(category => {
        // Find the best card for this category
        const bestCard = getBestCardForCategory(category);

        // Find the card used most often for this category
        const categoryTransactions = state.transactions.filter(t => t.category === category);
        const cardUsage: Record<string, number> = {};

        categoryTransactions.forEach(transaction => {
          if (!cardUsage[transaction.cardId]) {
            cardUsage[transaction.cardId] = 0;
          }
          cardUsage[transaction.cardId] += 1;
        });

        const mostUsedCardId = Object.entries(cardUsage)
          .sort(([, a], [, b]) => b - a)
          .map(([cardId]) => cardId)[0];

        // If the most used card is not the best card, create a suggestion
        if (bestCard && mostUsedCardId && bestCard.id !== mostUsedCardId) {
          const mostUsedCard = state.cards.find(c => c.id === mostUsedCardId);
          if (mostUsedCard) {
            const totalSpent = categorySpending[category];
            const currentCashback = totalSpent * (mostUsedCard.cashbackRate / 100);
            const potentialCashback = totalSpent * (bestCard.cashbackRate / 100);
            const potentialSavings = potentialCashback - currentCashback;

            if (potentialSavings > 0) {
              newSuggestions.push({
                id: `${category}-${bestCard.id}`,
                cardId: bestCard.id,
                reason: `You could earn more cashback on ${category} purchases`,
                category,
                potentialSavings,
              });
            }
          }
        }
      });

      setState(prevState => ({
        ...prevState,
        suggestions: newSuggestions,
      }));
    }
  }, [state.transactions]);

  // Add a new card
  const addCard = (card: Omit<Card, 'id'>) => {
    const newCard: Card = {
      ...card,
      id: Date.now().toString(),
    };

    setState(prevState => ({
      ...prevState,
      cards: [...prevState.cards, newCard],
      filteredCards: [...prevState.filteredCards, newCard],
    }));
  };

  // Remove a card
  const removeCard = (id: string) => {
    setState(prevState => ({
      ...prevState,
      cards: prevState.cards.filter(card => card.id !== id),
      filteredCards: prevState.filteredCards.filter(card => card.id !== id),
      selectedCard: prevState.selectedCard?.id === id ? null : prevState.selectedCard,
    }));
  };

  // Select a card
  const selectCard = (id: string) => {
    const card = state.cards.find(card => card.id === id) || null;
    setState(prevState => ({
      ...prevState,
      selectedCard: card,
    }));
  };

  // Filter cards by type
  const filterCards = useCallback((type: 'credit' | 'debit' | 'all' = 'all') => {
    const filtered = type === 'all'
        ? state.cards
        : state.cards.filter(card => card.type === type);

    setState(prevState => ({
      ...prevState,
      filteredCards: filtered,
    }));
  }, [state.cards]);
  // Add a transaction
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'cashbackAmount'>) => {
    const card = state.cards.find(card => card.id === transaction.cardId);
    if (!card) return;

    // Calculate cashback amount
    const cashbackAmount = calculateCashback(transaction.amount, card.cashbackRate);

    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      cashbackAmount,
    };

    setState(prevState => ({
      ...prevState,
      transactions: [newTransaction, ...prevState.transactions],
    }));
  };

  // Calculate cashback amount
  const calculateCashback = (amount: number, cashbackRate: number): number => {
    return amount * (cashbackRate / 100);
  };

  // Get the best card for a specific category
  const getBestCardForCategory = (category: string): Card | null => {
    const eligibleCards = state.cards.filter(card =>
      card.categories.includes(category) || card.categories.includes('general')
    );

    if (eligibleCards.length === 0) return null;

    return eligibleCards.reduce((best, current) =>
      current.cashbackRate > best.cashbackRate ? current : best
    );
  };

  // Process a payment
  const processPayment = async (
    amount: number,
    merchant: string,
    category: string,
    cardId?: string
  ): Promise<boolean> => {
    setState(prevState => ({ ...prevState, isLoading: true }));

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Determine which card to use
      const card = cardId
        ? state.cards.find(c => c.id === cardId)
        : getBestCardForCategory(category);

      if (!card) {
        throw new Error('No suitable card found');
      }

      // Check if card has sufficient funds/credit
      if (card.type === 'debit' && card.balance !== undefined && card.balance < amount) {
        throw new Error('Insufficient funds');
      }

      if (card.type === 'credit' && card.limit !== undefined) {
        // Get total spent on this card
        const totalSpent = state.transactions
          .filter(t => t.cardId === card.id)
          .reduce((sum, t) => sum + t.amount, 0);

        if (totalSpent + amount > card.limit) {
          throw new Error('Credit limit exceeded');
        }
      }

      // Add the transaction
      const transaction: Omit<Transaction, 'id' | 'cashbackAmount'> = {
        cardId: card.id,
        amount,
        merchant,
        date: new Date(),
        category,
      };

      addTransaction(transaction);

      // Trigger success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      return true;
    } catch (error) {
      // Trigger error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      console.error('Payment processing error:', error);
      return false;
    } finally {
      setState(prevState => ({ ...prevState, isLoading: false }));
    }
  };

  const value: WalletContextValue = {
    ...state,
    addCard,
    removeCard,
    selectCard,
    filterCards,
    addTransaction,
    processPayment,
    getBestCardForCategory,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the wallet context
export const useWallet = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
