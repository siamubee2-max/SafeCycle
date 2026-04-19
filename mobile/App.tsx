/**
 * SafeCycle — Native Mobile App
 * Uses a WebView to load the SafeCycle PWA.
 * Handles In-App Purchases via RevenueCat (react-native-purchases).
 *
 * In production:
 *   - WEB_APP_URL points to your hosted SafeCycle PWA (e.g., https://inferencevision.store/safecycle)
 *   - In development / simulator: loads from local Vite dev server
 *
 * RevenueCat IAP:
 *   - Product ID:  store.inferencevision.safecycle.lifetime
 *   - Entitlement: lifetime
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
// RevenueCat — may not be available in Expo Go (no native module)
let Purchases: any = null;
let LOG_LEVEL: any = { ERROR: 0 };
type PurchasesPackage = any;
try {
  const rc = require('react-native-purchases');
  Purchases = rc.default || rc;
  LOG_LEVEL = rc.LOG_LEVEL || { ERROR: 0 };
} catch {
  console.warn('[SafeCycle] RevenueCat not available (Expo Go mode)');
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const WEB_APP_URL = process.env.EXPO_PUBLIC_WEB_APP_URL || 'https://inferencevision.store/safecycle';

// RevenueCat API Keys — see mobile/STORE_SUBMISSION.md for setup instructions
const REVENUECAT_APPLE_KEY = process.env.EXPO_PUBLIC_RC_APPLE_KEY || '';
const REVENUECAT_GOOGLE_KEY = process.env.EXPO_PUBLIC_RC_GOOGLE_KEY || '';

// Time in ms before surfacing an error if the WebView hasn't loaded
const LOAD_TIMEOUT_MS = 20_000;

// Guard: warn loudly in dev if keys are missing or still placeholders
if (__DEV__) {
  if (!REVENUECAT_APPLE_KEY || REVENUECAT_APPLE_KEY.startsWith('appl_XXXX')) {
    console.warn('[SafeCycle] ⚠️  EXPO_PUBLIC_RC_APPLE_KEY is missing or placeholder');
  }
  if (
    !REVENUECAT_GOOGLE_KEY ||
    REVENUECAT_GOOGLE_KEY.startsWith('REMPLACER') ||
    REVENUECAT_GOOGLE_KEY.startsWith('test_') ||
    REVENUECAT_GOOGLE_KEY.startsWith('goog_XXXX')
  ) {
    console.warn(
      '[SafeCycle] ⚠️  EXPO_PUBLIC_RC_GOOGLE_KEY is missing or placeholder — Android IAP will NOT work in production. See mobile/STORE_SUBMISSION.md'
    );
  }
}

// IAP identifiers
const LIFETIME_PRODUCT_ID = 'store.inferencevision.safecycle.lifetime';
const LIFETIME_ENTITLEMENT = 'lifetime';

// ─────────────────────────────────────────────────────────────────────────────
// PURCHASE HOOK
// ─────────────────────────────────────────────────────────────────────────────

function usePurchases() {
  const [isLifetime, setIsLifetime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lifetimePackage, setLifetimePackage] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    const init = async () => {
      // Skip RevenueCat in Expo Go (no native module)
      if (!Purchases) {
        setIsLoading(false);
        return;
      }
      try {
        Purchases.setLogLevel(LOG_LEVEL.ERROR);

        if (Platform.OS === 'ios') {
          await Purchases.configure({ apiKey: REVENUECAT_APPLE_KEY });
        } else {
          await Purchases.configure({ apiKey: REVENUECAT_GOOGLE_KEY });
        }

        // Check current entitlement status
        const customerInfo = await Purchases.getCustomerInfo();
        const hasLifetime = !!customerInfo.entitlements.active[LIFETIME_ENTITLEMENT];
        setIsLifetime(hasLifetime);

        // Fetch available packages
        const offerings = await Purchases.getOfferings();
        const current = offerings.current;
        if (current) {
          const pkg =
            current.lifetime ??
            current.availablePackages.find(
              (p: any) => p.product.identifier === LIFETIME_PRODUCT_ID
            ) ??
            null;
          setLifetimePackage(pkg);
        }
      } catch (err) {
        console.error('RevenueCat init error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const purchaseLifetime = useCallback(async (): Promise<boolean> => {
    if (!Purchases) {
      console.warn('[SafeCycle] RevenueCat not available');
      return false;
    }
    if (!lifetimePackage) {
      Alert.alert('Error', 'Lifetime product not available. Please try again.');
      return false;
    }
    try {
      setIsLoading(true);
      const { customerInfo } = await Purchases.purchasePackage(lifetimePackage);
      const success = !!customerInfo.entitlements.active[LIFETIME_ENTITLEMENT];
      setIsLifetime(success);
      return success;
    } catch (err: any) {
      if (!err.userCancelled) {
        Alert.alert('Purchase Error', err.message || 'An error occurred during purchase.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [lifetimePackage]);

  const restorePurchases = useCallback(async (): Promise<void> => {
    if (!Purchases) {
      console.warn('[SafeCycle] RevenueCat not available');
      return;
    }
    try {
      setIsLoading(true);
      const customerInfo = await Purchases.restorePurchases();
      const hasLifetime = !!customerInfo.entitlements.active[LIFETIME_ENTITLEMENT];
      setIsLifetime(hasLifetime);
      Alert.alert(
        hasLifetime ? 'Purchases Restored ✓' : 'Nothing to Restore',
        hasLifetime
          ? 'Your SafeCycle Lifetime access has been restored.'
          : 'No previous purchases found for this Apple ID.'
      );
    } catch (err: any) {
      Alert.alert('Restore Error', err.message || 'Could not restore purchases.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLifetime, isLoading, lifetimePackage, purchaseLifetime, restorePurchases };
}

// ─────────────────────────────────────────────────────────────────────────────
// BRIDGE SCRIPT
// Injected into the WebView to expose native purchase capabilities to the PWA.
// Only injected once via injectedJavaScriptBeforeContentLoaded.
// ─────────────────────────────────────────────────────────────────────────────

function getBridgeScript(isLifetime: boolean) {
  return `
    (function() {
      if (window.__SAFECYCLE_NATIVE__) return; // Already injected — idempotent
      window.__SAFECYCLE_NATIVE__ = true;
      window.__SAFECYCLE_IS_LIFETIME__ = ${isLifetime ? 'true' : 'false'};

      // PWA → Native: purchase request
      window.safecyclePurchaseLifetime = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PURCHASE_LIFETIME' }));
      };

      // PWA → Native: restore purchases
      window.safecycleRestorePurchases = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'RESTORE_PURCHASES' }));
      };

      // Notify PWA that native bridge is ready
      window.dispatchEvent(new CustomEvent('safecycle-bridge-ready', { detail: { isLifetime: ${isLifetime ? 'true' : 'false'} } }));

      true; // Required by react-native-webview
    })();
  `;
}

// Script to update isLifetime status after a purchase without full re-injection
function getUpdateLifetimeScript(isLifetime: boolean) {
  return `
    (function() {
      window.__SAFECYCLE_IS_LIFETIME__ = ${isLifetime ? 'true' : 'false'};
      window.dispatchEvent(new CustomEvent('safecycle-purchase-result', {
        detail: { success: ${isLifetime ? 'true' : 'false'} }
      }));
      true;
    })();
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);
  const [webViewError, setWebViewError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  const { isLifetime, isLoading, purchaseLifetime, restorePurchases } = usePurchases();

  // ── Loading timeout ────────────────────────────────────────────────────────
  // If the WebView hasn't fired onLoadEnd within LOAD_TIMEOUT_MS, surface an
  // error so the user is never stuck on an infinite loading screen.
  useEffect(() => {
    if (isWebViewLoaded) return;
    const timer = setTimeout(() => {
      setIsWebViewLoaded(true);
      setWebViewError(true);
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isWebViewLoaded]);

  // ── Retry handler ──────────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    setIsWebViewLoaded(false);
    setWebViewError(false);
    webViewRef.current?.reload();
  }, []);

  // ── Android back button ────────────────────────────────────────────────────
  useEffect(() => {
    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [canGoBack]);

  // When isLifetime changes AFTER initial load (due to a purchase/restore),
  // inject an update script rather than re-setting injectedJavaScript.
  const prevIsLifetimeRef = useRef(isLifetime);
  useEffect(() => {
    if (isWebViewLoaded && prevIsLifetimeRef.current !== isLifetime) {
      webViewRef.current?.injectJavaScript(getUpdateLifetimeScript(isLifetime));
    }
    prevIsLifetimeRef.current = isLifetime;
  }, [isLifetime, isWebViewLoaded]);

  // Bridge script injected once before content loads
  const bridgeScript = getBridgeScript(isLifetime);

  // Handle messages from the WebView (PWA → Native)
  const onMessage = useCallback(
    async (event: any) => {
      let msg: { type: string } | null = null;
      try {
        msg = JSON.parse(event.nativeEvent.data);
      } catch {
        // Non-JSON message from WebView — ignore
        return;
      }

      switch (msg?.type) {
        case 'PURCHASE_LIFETIME': {
          const success = await purchaseLifetime();
          // Result is sent via the isLifetime useEffect above (via injectJavaScript)
          if (!success) {
            // If failed, still notify the PWA so it can unblock its UI
            webViewRef.current?.injectJavaScript(
              `(function(){window.dispatchEvent(new CustomEvent('safecycle-purchase-result',{detail:{success:false}}));true;})();`
            );
          }
          break;
        }
        case 'RESTORE_PURCHASES':
          await restorePurchases();
          break;
        default:
          break;
      }
    },
    [purchaseLifetime, restorePurchases]
  );

  const onNavigationStateChange = (state: WebViewNavigation) => {
    setCanGoBack(state.canGoBack);
  };

  // Only show the full loading overlay on initial load, not during purchases
  const showLoadingOverlay = !isWebViewLoaded;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#003634" translucent={false} />

      {/* Loading overlay — only during initial page load */}
      {showLoadingOverlay && (
        <View style={styles.loadingOverlay}>
          <View style={styles.splashContent}>
            <Text style={styles.splashTitle}>SafeCycle</Text>
            <Text style={styles.splashTagline}>Your private sanctuary</Text>
            <ActivityIndicator color="#C6A87C" size="large" style={styles.spinner} />
          </View>
        </View>
      )}

      {/* Error state — visible once loading overlay is dismissed */}
      {webViewError && !showLoadingOverlay && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>
            Could not load SafeCycle. Please check your internet connection and try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.8}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={[styles.webView, (showLoadingOverlay || webViewError) && styles.hidden]}
        // Inject bridge before content loads — only once, idempotent
        injectedJavaScriptBeforeContentLoaded={bridgeScript}
        onMessage={onMessage}
        onNavigationStateChange={onNavigationStateChange}
        // onLoadEnd fires when the page is fully loaded (including JS execution),
        // which is more reliable than onLoad for detecting blank-screen scenarios.
        onLoadEnd={() => {
          setIsWebViewLoaded(true);
          setWebViewError(false);
        }}
        onError={() => {
          // FIX: also set isWebViewLoaded so the loading overlay is dismissed
          // and the error overlay becomes visible to the user.
          setIsWebViewLoaded(true);
          setWebViewError(true);
        }}
        onHttpError={(e) => {
          // Only treat 5xx as hard errors; 4xx usually render their own page
          if (e.nativeEvent.statusCode >= 500) {
            setIsWebViewLoaded(true);
            setWebViewError(true);
          }
        }}
        // Security & features
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={true}
        javaScriptEnabled
        domStorageEnabled
        // iOS
        allowsBackForwardNavigationGestures
        sharedCookiesEnabled
        // Allow same-origin navigation, about:blank, data URIs, and blob: URLs
        // (blob: is needed for Vite-built JS workers and dynamic imports).
        // Truly external domains are rejected.
        onShouldStartLoadWithRequest={(request) => {
          const url = request.url;
          if (
            url === 'about:blank' ||
            url.startsWith('data:') ||
            url.startsWith('blob:') ||
            url.startsWith(WEB_APP_URL) ||
            // Allow the root domain too (for redirects within the site)
            url.startsWith('https://inferencevision.store')
          ) {
            return true;
          }
          // Block truly external navigation
          return false;
        }}
      />

      {/* Purchase loading overlay — non-blocking, shown on top of WebView */}
      {isLoading && isWebViewLoaded && !webViewError && (
        <View style={styles.purchaseOverlay}>
          <ActivityIndicator color="#C6A87C" size="large" />
        </View>
      )}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003634',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  hidden: {
    opacity: 0,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#003634',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  splashContent: {
    alignItems: 'center',
    gap: 8,
  },
  splashTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  splashTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  spinner: {
    marginTop: 32,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#003634',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    padding: 32,
  },
  errorTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  retryButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    backgroundColor: '#C6A87C',
    borderRadius: 50,
  },
  retryButtonText: {
    color: '#003634',
    fontWeight: '700',
    fontSize: 16,
  },
  purchaseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
});
