import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Account, Position, Order } from '@/types/trading';
import { API_ROUTES } from '@/config/constants';

interface TradingState {
  // Data
  account: Account | null;
  positions: Position[];
  orders: Order[];
  orderHistory: Order[];

  // Loading states
  isLoadingAccount: boolean;
  isLoadingPositions: boolean;
  isLoadingOrders: boolean;
  isSubmittingOrder: boolean;

  // Error states
  accountError: string | null;
  positionsError: string | null;
  ordersError: string | null;
  orderSubmitError: string | null;

  // Actions
  fetchAccount: () => Promise<void>;
  fetchPositions: () => Promise<void>;
  fetchOrders: (status?: 'open' | 'closed' | 'all') => Promise<void>;
  submitOrder: (order: OrderSubmitParams) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  cancelAllOrders: () => Promise<boolean>;
  closePosition: (symbol: string) => Promise<boolean>;
  closeAllPositions: () => Promise<boolean>;

  // Local updates
  setAccount: (account: Account) => void;
  setPositions: (positions: Position[]) => void;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  removeOrder: (orderId: string) => void;
  clearErrors: () => void;
}

interface OrderSubmitParams {
  symbol: string;
  qty?: number;
  notional?: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  time_in_force?: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  limit_price?: number;
  stop_price?: number;
}

export const useTradingStore = create<TradingState>()(
  subscribeWithSelector((set, get) => ({
    account: null,
    positions: [],
    orders: [],
    orderHistory: [],
    isLoadingAccount: false,
    isLoadingPositions: false,
    isLoadingOrders: false,
    isSubmittingOrder: false,
    accountError: null,
    positionsError: null,
    ordersError: null,
    orderSubmitError: null,

    fetchAccount: async () => {
      set({ isLoadingAccount: true, accountError: null });
      try {
        const response = await fetch(API_ROUTES.ACCOUNT);
        if (!response.ok) {
          throw new Error('Failed to fetch account');
        }
        const account = await response.json();
        set({ account, isLoadingAccount: false });
      } catch (error) {
        set({
          accountError: error instanceof Error ? error.message : 'Unknown error',
          isLoadingAccount: false,
        });
      }
    },

    fetchPositions: async () => {
      set({ isLoadingPositions: true, positionsError: null });
      try {
        const response = await fetch(API_ROUTES.POSITIONS);
        if (!response.ok) {
          throw new Error('Failed to fetch positions');
        }
        const positions = await response.json();
        set({ positions, isLoadingPositions: false });
      } catch (error) {
        set({
          positionsError: error instanceof Error ? error.message : 'Unknown error',
          isLoadingPositions: false,
        });
      }
    },

    fetchOrders: async (status = 'open') => {
      set({ isLoadingOrders: true, ordersError: null });
      try {
        const response = await fetch(`${API_ROUTES.ORDERS}?status=${status}`);
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const orders = await response.json();
        if (status === 'open') {
          set({ orders, isLoadingOrders: false });
        } else if (status === 'closed') {
          set({ orderHistory: orders, isLoadingOrders: false });
        } else {
          // 'all' - separate into open and closed
          const openOrders = orders.filter((o: Order) =>
            ['new', 'partially_filled', 'pending_new', 'accepted'].includes(o.status)
          );
          const closedOrders = orders.filter((o: Order) =>
            !['new', 'partially_filled', 'pending_new', 'accepted'].includes(o.status)
          );
          set({
            orders: openOrders,
            orderHistory: closedOrders,
            isLoadingOrders: false,
          });
        }
      } catch (error) {
        set({
          ordersError: error instanceof Error ? error.message : 'Unknown error',
          isLoadingOrders: false,
        });
      }
    },

    submitOrder: async (orderParams) => {
      set({ isSubmittingOrder: true, orderSubmitError: null });
      try {
        const response = await fetch(API_ROUTES.ORDERS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderParams),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to submit order');
        }

        const order = await response.json();
        get().addOrder(order);
        set({ isSubmittingOrder: false });
        return order;
      } catch (error) {
        set({
          orderSubmitError: error instanceof Error ? error.message : 'Unknown error',
          isSubmittingOrder: false,
        });
        return null;
      }
    },

    cancelOrder: async (orderId) => {
      try {
        const response = await fetch(`${API_ROUTES.ORDERS}?id=${orderId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to cancel order');
        }
        get().removeOrder(orderId);
        return true;
      } catch (error) {
        console.error('Error cancelling order:', error);
        return false;
      }
    },

    cancelAllOrders: async () => {
      try {
        const response = await fetch(API_ROUTES.ORDERS, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error('Failed to cancel all orders');
        }
        set({ orders: [] });
        return true;
      } catch (error) {
        console.error('Error cancelling all orders:', error);
        return false;
      }
    },

    closePosition: async (symbol) => {
      try {
        const response = await fetch(`${API_ROUTES.POSITIONS}?symbol=${symbol}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to close position');
        }
        // Refetch positions to update
        get().fetchPositions();
        return true;
      } catch (error) {
        console.error('Error closing position:', error);
        return false;
      }
    },

    closeAllPositions: async () => {
      try {
        const response = await fetch(API_ROUTES.POSITIONS, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error('Failed to close all positions');
        }
        set({ positions: [] });
        return true;
      } catch (error) {
        console.error('Error closing all positions:', error);
        return false;
      }
    },

    setAccount: (account) => set({ account }),
    setPositions: (positions) => set({ positions }),
    setOrders: (orders) => set({ orders }),

    addOrder: (order) =>
      set((state) => ({
        orders: [order, ...state.orders],
      })),

    updateOrder: (order) =>
      set((state) => ({
        orders: state.orders.map((o) => (o.id === order.id ? order : o)),
      })),

    removeOrder: (orderId) =>
      set((state) => ({
        orders: state.orders.filter((o) => o.id !== orderId),
      })),

    clearErrors: () =>
      set({
        accountError: null,
        positionsError: null,
        ordersError: null,
        orderSubmitError: null,
      }),
  }))
);

// Non-reactive getter
export const getTradingState = () => useTradingStore.getState();

// Selectors
export const selectAccount = (state: TradingState) => state.account;
export const selectPositions = (state: TradingState) => state.positions;
export const selectOrders = (state: TradingState) => state.orders;

export const selectPositionBySymbol = (symbol: string) => (state: TradingState) =>
  state.positions.find((p) => p.symbol === symbol);

export const selectTotalUnrealizedPl = (state: TradingState) =>
  state.positions.reduce((sum, p) => sum + p.unrealizedPl, 0);

export const selectTotalMarketValue = (state: TradingState) =>
  state.positions.reduce((sum, p) => sum + p.marketValue, 0);
