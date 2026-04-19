/**
 * SafeCycle — Native Bridge Hook
 * Detects if the app is running inside the Expo WebView wrapper
 * and exposes native IAP functions (purchase, restore).
 *
 * Usage in any React component:
 *   const { isNative, isLifetime, purchaseLifetime, restorePurchases } = useNativeBridge();
 */

import { useState, useEffect, useCallback, useRef } from 'react';

declare global {
  interface Window {
    __SAFECYCLE_NATIVE__?: boolean;
    __SAFECYCLE_IS_LIFETIME__?: boolean;
    safecyclePurchaseLifetime?: () => void;
    safecycleRestorePurchases?: () => void;
    ReactNativeWebView?: { postMessage: (msg: string) => void };
  }
}

export interface NativeBridge {
  /** True when running inside the Expo native wrapper */
  isNative: boolean;
  /** True when the user has an active lifetime purchase */
  isLifetime: boolean;
  /** Triggers the native purchase flow */
  purchaseLifetime: () => Promise<boolean>;
  /** Restores previous purchases */
  restorePurchases: () => Promise<void>;
}

export function useNativeBridge(): NativeBridge {
  const [isNative, setIsNative] = useState(false);
  const [isLifetime, setIsLifetime] = useState(false);
  // Track pending purchase resolvers so we can clean them up
  const purchaseResolverRef = useRef<((success: boolean) => void) | null>(null);

  useEffect(() => {
    // Check if we're inside the native WebView
    const checkNative = () => {
      if (window.__SAFECYCLE_NATIVE__) {
        setIsNative(true);
        setIsLifetime(!!window.__SAFECYCLE_IS_LIFETIME__);
      }
    };

    checkNative();

    // Listen for bridge ready event (delayed injection)
    const onBridgeReady = (e: Event) => {
      const detail = (e as CustomEvent<{ isLifetime: boolean }>).detail;
      setIsNative(true);
      setIsLifetime(detail.isLifetime);
    };

    // Global purchase result listener — always updates isLifetime state
    const onPurchaseResult = (e: Event) => {
      const detail = (e as CustomEvent<{ success: boolean }>).detail;
      if (detail.success) {
        setIsLifetime(true);
      }
      // Resolve any pending purchase promise
      if (purchaseResolverRef.current) {
        purchaseResolverRef.current(detail.success);
        purchaseResolverRef.current = null;
      }
    };

    window.addEventListener('safecycle-bridge-ready', onBridgeReady);
    window.addEventListener('safecycle-purchase-result', onPurchaseResult);

    return () => {
      window.removeEventListener('safecycle-bridge-ready', onBridgeReady);
      window.removeEventListener('safecycle-purchase-result', onPurchaseResult);
      // Resolve any dangling promise as failure (component unmounted during purchase)
      if (purchaseResolverRef.current) {
        purchaseResolverRef.current(false);
        purchaseResolverRef.current = null;
      }
    };
  }, []);

  const purchaseLifetime = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!isNative || !window.safecyclePurchaseLifetime) {
        console.warn('purchaseLifetime called outside native context');
        resolve(false);
        return;
      }

      // If there's already a pending purchase, reject the new one immediately
      if (purchaseResolverRef.current) {
        console.warn('Purchase already in progress');
        resolve(false);
        return;
      }

      // Store resolver — will be called by the global onPurchaseResult handler
      purchaseResolverRef.current = resolve;
      // Set a 60-second timeout in case the native side never responds
      const timeout = setTimeout(() => {
        if (purchaseResolverRef.current === resolve) {
          purchaseResolverRef.current = null;
          resolve(false);
        }
      }, 60_000);

      // Override resolver to also clear timeout
      purchaseResolverRef.current = (success: boolean) => {
        clearTimeout(timeout);
        resolve(success);
      };

      window.safecyclePurchaseLifetime();
    });
  }, [isNative]);

  const restorePurchases = useCallback(async (): Promise<void> => {
    if (!isNative || !window.safecycleRestorePurchases) {
      console.warn('restorePurchases called outside native context');
      return;
    }
    window.safecycleRestorePurchases();
  }, [isNative]);

  return { isNative, isLifetime, purchaseLifetime, restorePurchases };
}
