"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ServicePackage, Service } from "@/types/service";
import type { ActionResponse } from "@/actions/auth.actions";
import {
  getCartAction,
  addToCartAction,
  updateCartItemQuantityAction,
  removeCartItemAction,
  setCartItemStatusAction,
  clearActiveCartAction,
} from "@/actions/cart.actions";

export type CartItem = {
  id: string; // the package's real database id
  serviceId: string;
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

async function runMutation(
  action: () => Promise<ActionResponse<unknown>>,
  rollback: () => void,
  fallbackError: string
) {
  try {
    const res = await action();
    if (!res.success) {
      rollback();
      toast.error(res.error || fallbackError);
    }
  } catch {
    rollback();
    toast.error(fallbackError);
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const loadedForSession = useRef(false);

  // Cart is per-user and DB-backed: load it once per authenticated session,
  // and wipe the local view on sign-out so the next user never sees it.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === "authenticated" && !loadedForSession.current) {
        loadedForSession.current = true;
        getCartAction().then((res) => {
          if (res.success && res.data) {
            setItems(res.data.items);
            setSavedItems(res.data.savedItems);
          }
        });
      } else if (status === "unauthenticated") {
        loadedForSession.current = false;
        setItems([]);
        setSavedItems([]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [status]);

  const addToCart = (service: Service, pkg: ServicePackage) => {
    const id = pkg.id;
    const prevItems = items;
    const prevSaved = savedItems;

    const existingActive = items.find((i) => i.id === id);
    const existingSaved = savedItems.find((i) => i.id === id);

    if (existingActive) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)));
    } else if (existingSaved) {
      // Same package was saved for later — re-adding it just brings it back to the active cart.
      setSavedItems((prev) => prev.filter((i) => i.id !== id));
      setItems((prev) => [...prev, existingSaved]);
    } else {
      setItems((prev) => [...prev, { id, serviceId: service.id, serviceTitle: service.title, pkg, quantity: 1 }]);
    }

    runMutation(
      () => addToCartAction(pkg.id),
      () => {
        setItems(prevItems);
        setSavedItems(prevSaved);
      },
      "Failed to add item to cart"
    );
  };

  const removeFromCart = (itemId: string) => {
    const prevItems = items;
    setItems((prev) => prev.filter((item) => item.id !== itemId));

    runMutation(
      () => removeCartItemAction(itemId),
      () => setItems(prevItems),
      "Failed to remove item"
    );
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const prevItems = items;
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)));

    runMutation(
      () => updateCartItemQuantityAction(itemId, quantity),
      () => setItems(prevItems),
      "Failed to update quantity"
    );
  };

  const clearCart = () => {
    const prevItems = items;
    setItems([]);

    runMutation(() => clearActiveCartAction(), () => setItems(prevItems), "Failed to clear cart");
  };

  const saveForLater = (itemId: string) => {
    const itemToSave = items.find((item) => item.id === itemId);
    if (!itemToSave) return;
    const prevItems = items;
    const prevSaved = savedItems;

    setSavedItems((prev) => [...prev, itemToSave]);
    setItems((prev) => prev.filter((item) => item.id !== itemId));

    runMutation(
      () => setCartItemStatusAction(itemId, "SAVED"),
      () => {
        setItems(prevItems);
        setSavedItems(prevSaved);
      },
      "Failed to save item for later"
    );
  };

  const moveToCart = (itemId: string) => {
    const itemToMove = savedItems.find((item) => item.id === itemId);
    if (!itemToMove) return;
    const prevItems = items;
    const prevSaved = savedItems;

    setItems((prev) => {
      const existingItemIndex = prev.findIndex((item) => item.id === itemId);
      if (existingItemIndex >= 0) {
        const newItems = [...prev];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + itemToMove.quantity,
        };
        return newItems;
      }
      return [...prev, itemToMove];
    });
    setSavedItems((prev) => prev.filter((item) => item.id !== itemId));

    runMutation(
      () => setCartItemStatusAction(itemId, "ACTIVE"),
      () => {
        setItems(prevItems);
        setSavedItems(prevSaved);
      },
      "Failed to move item to cart"
    );
  };

  const removeFromSaved = (itemId: string) => {
    const prevSaved = savedItems;
    setSavedItems((prev) => prev.filter((item) => item.id !== itemId));

    runMutation(
      () => removeCartItemAction(itemId),
      () => setSavedItems(prevSaved),
      "Failed to remove item"
    );
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
