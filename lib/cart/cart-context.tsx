'use client';

import React, { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => { success: boolean; message?: string };
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'motoservice_cart_v1';
const SERVER_SNAPSHOT: CartItem[] = [];

let memoryItems: CartItem[] = [];
let hasInitialized = false;
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function initMemoryFromStorage() {
  if (typeof window === 'undefined' || hasInitialized) return;
  hasInitialized = true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        memoryItems = parsed;
      }
    }
  } catch {
    memoryItems = [];
  }
}

function persistToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('[NeroElectric Motors] Error al persistir carrito local:', e);
  }
}

const cartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          memoryItems = e.newValue ? JSON.parse(e.newValue) : [];
        } catch {
          memoryItems = [];
        }
        emitChange();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }
    return () => {
      listeners.delete(listener);
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
    };
  },
  getSnapshot(): CartItem[] {
    initMemoryFromStorage();
    return memoryItems;
  },
  getServerSnapshot(): CartItem[] {
    return SERVER_SNAPSHOT;
  },
  update(updater: (prev: CartItem[]) => CartItem[]) {
    initMemoryFromStorage();
    const next = updater(memoryItems);
    memoryItems = next;
    persistToStorage(next);
    emitChange();
  },
};

const emptySubscribe = () => () => {};

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Sincronización externa sin setState síncrono en effect (evita cascading renders y hydration mismatch)
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );

  const isLoaded = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const addItem = (item: Omit<CartItem, 'quantity'>, quantity = 1): { success: boolean; message?: string } => {
    if (!item.isDirectSale || item.stockAvailable <= 0) {
      return {
        success: false,
        message: `El repuesto «${item.name}» requiere consultar disponibilidad con proveedor y no puede añadirse al carrito directo.`,
      };
    }

    let addedSuccess = true;
    let feedbackMessage: string | undefined;

    cartStore.update((prev) => {
      const existing = prev.find((i) => i.sku.toUpperCase() === item.sku.toUpperCase());
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > item.stockAvailable) {
          addedSuccess = false;
          feedbackMessage = `No hay suficiente stock. Límite disponible: ${item.stockAvailable} unidades.`;
          return prev;
        }
        return prev.map((i) =>
          i.sku.toUpperCase() === item.sku.toUpperCase() ? { ...i, quantity: newQty } : i
        );
      }

      if (quantity > item.stockAvailable) {
        addedSuccess = false;
        feedbackMessage = `No hay suficiente stock disponible.`;
        return prev;
      }

      return [...prev, { ...item, quantity }];
    });

    return {
      success: addedSuccess,
      message: feedbackMessage || `«${item.name}» añadido al carrito.`,
    };
  };

  const removeItem = (sku: string) => {
    cartStore.update((prev) => prev.filter((i) => i.sku.toUpperCase() !== sku.toUpperCase()));
  };

  const updateQuantity = (sku: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(sku);
      return;
    }
    cartStore.update((prev) =>
      prev.map((i) => {
        if (i.sku.toUpperCase() === sku.toUpperCase()) {
          const clamped = Math.min(quantity, i.stockAvailable);
          return { ...i, quantity: clamped };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    cartStore.update(() => []);
  };

  const totalCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    const val = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return Math.round(val * 100) / 100;
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider.');
  }
  return context;
}
