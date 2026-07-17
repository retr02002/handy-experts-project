"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ServicePackage, Service } from "@/data/mockServices";

export type CartItem = {
  id: string; // unique id combining service id and package name
  serviceId: number;
  serviceTitle: string;
  pkg: ServicePackage;
  quantity: number;
};

interface CartContextType {
  items: CartItem[];
  savedItems: CartItem[];
  addToCart: (service: Service, pkg: ServicePackage) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  saveForLater: (itemId: string) => void;
  moveToCart: (itemId: string) => void;
  removeFromSaved: (itemId: string) => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);

  const addToCart = (service: Service, pkg: ServicePackage) => {
    setItems((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) => item.serviceId === service.id && item.pkg.name === pkg.name
      );

      if (existingItemIndex >= 0) {
        const newItems = [...prev];
        newItems[existingItemIndex].quantity += 1;
        return newItems;
      }

      return [
        ...prev,
        {
          id: `${service.id}-${pkg.name}`,
          serviceId: service.id,
          serviceTitle: service.title,
          pkg,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const saveForLater = (itemId: string) => {
    const itemToSave = items.find((item) => item.id === itemId);
    if (itemToSave) {
      setSavedItems((prev) => [...prev, itemToSave]);
      removeFromCart(itemId);
    }
  };

  const moveToCart = (itemId: string) => {
    const itemToMove = savedItems.find((item) => item.id === itemId);
    if (itemToMove) {
      setItems((prev) => {
        const existingItemIndex = prev.findIndex((item) => item.id === itemId);
        if (existingItemIndex >= 0) {
          const newItems = [...prev];
          newItems[existingItemIndex].quantity += itemToMove.quantity;
          return newItems;
        }
        return [...prev, itemToMove];
      });
      removeFromSaved(itemId);
    }
  };

  const removeFromSaved = (itemId: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.pkg.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        savedItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        saveForLater,
        moveToCart,
        removeFromSaved,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
