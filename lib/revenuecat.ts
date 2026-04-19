import { Alert, Platform } from 'react-native';
import Purchases, { LOG_LEVEL, CustomerInfo } from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';
import Constants from 'expo-constants';

// Configuration keys from environment variables
const REVENUECAT_APPLE_KEY = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || '';
const REVENUECAT_GOOGLE_KEY = process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || '';

// The entitlement identifier you created in the RevenueCat dashboard
export const ENTITLEMENT_ID = 'Sunnan Pro';

// Check if we are running in Expo Go (standard app store app)
// Native UI modules like RevenueCat Paywalls require a Development Build (npx expo run:android)
const isExpoGo = Constants.appOwnership === 'expo';
const isWeb = Platform.OS === 'web';
const isServer = typeof document === 'undefined' && isWeb;

let isConfigured = false;

/**
 * Initializes the RevenueCat SDK.
 * Call this early in your app's lifecycle (e.g., in app/_layout.tsx).
 */
export const configureRevenueCat = async () => {
    // Prevent execution on server-side (for Expo Router static/server output)
    if (isServer) return;

    try {
        // Set log level early
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        
        if (isWeb) {
            console.log('RevenueCat: Web platform detected. Full SDK features may require browser setup.');
            // On Web, you might need to use Purchases.configure({ apiKey: '...', appUserID: '...' });
            // but for now we skip to avoid "document is not available" errors if not in a browser
            return;
        }

        if (Platform.OS === 'ios') {
            if (REVENUECAT_APPLE_KEY) {
                Purchases.configure({ apiKey: REVENUECAT_APPLE_KEY });
                isConfigured = true;
                console.log('RevenueCat configured for iOS');
            } else {
                console.warn('RevenueCat Apple Key is missing.');
            }
        } else if (Platform.OS === 'android') {
            if (REVENUECAT_GOOGLE_KEY) {
                Purchases.configure({ apiKey: REVENUECAT_GOOGLE_KEY });
                isConfigured = true;
                console.log('RevenueCat configured for Android');
            } else {
                console.warn('RevenueCat Google Key is missing.');
            }
        }

        if (isExpoGo) {
            console.warn('RevenueCat: Running in Expo Go. Note that native Paywalls (RevenueCatUI) require a Development Build.');
        }
    } catch (e) {
        console.error('RevenueCat configuration failed:', e);
    }
};

/**
 * Checks if the user has an active 'Sunnan Pro' entitlement.
 */
export const checkSubscriptionStatus = async (): Promise<boolean> => {
    if (!isConfigured || isServer) return false;
    try {
        const customerInfo = await Purchases.getCustomerInfo();
        return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    } catch (e) {
        console.error('Error checking subscription status:', e);
        return false;
    }
};

/**
 * Links the user ID from Clerk to RevenueCat.
 */
export const identifyUser = async (userId: string) => {
    if (!isConfigured || isServer) return null;
    try {
        const { customerInfo } = await Purchases.logIn(userId);
        console.log('User identified in RevenueCat:', userId);
        return customerInfo;
    } catch (error) {
        console.error('Error identifying user in RevenueCat:', error);
        return null;
    }
};

/**
 * Unlinks the user when logging out.
 */
export const logoutUser = async () => {
    if (!isConfigured || isServer) return;
    try {
        const customerInfo = await Purchases.getCustomerInfo();
        if (customerInfo.originalAppUserId.startsWith('$RCAnonymousID')) {
            console.log('User is already anonymous, skipping RevenueCat logout');
            return;
        }
        await Purchases.logOut();
        console.log('User logged out from RevenueCat');
    } catch (error) {
        console.error('Error logging out user from RevenueCat:', error);
    }
};

/**
 * Presents the RevenueCat Paywall.
 * Use this for manual triggers like "Upgrade" buttons.
 */
export const showPaywall = async () => {
    if (isServer) return null;

    if (isExpoGo && Platform.OS !== 'web') {
        Alert.alert(
            'Development Build Required', 
            'Native Paywalls do not work in Expo Go. To test this feature on Android, you must use a Development Build (npx expo run:android) or test on Web if configured.'
        );
        return null;
    }

    if (!isConfigured) {
        Alert.alert(
            'Configuration Error', 
            'RevenueCat is not configured correctly. Check your API keys in .env and ensure you are not on an unsupported platform.'
        );
        return null;
    }

    try {
        // Safe check for the UI module
        if (!RevenueCatUI || typeof RevenueCatUI.presentPaywall !== 'function') {
            throw new Error('RevenueCatUI module not found or presentPaywall is missing.');
        }

        const result = await RevenueCatUI.presentPaywall();
        console.log('Paywall closed with result:', result);
        return result;
    } catch (error: any) {
        console.error('Error presenting paywall:', error);
        
        // Handle the specific "document is not available" error or missing native module gracefully
        const errorMsg = error.message || '';
        if (errorMsg.includes('document is not available') || errorMsg.includes('browser environment')) {
            Alert.alert('Environment Error', 'RevenueCat Paywall is trying to use a browser feature in a native environment. This usually happens when the native UI module is missing.');
        } else {
            Alert.alert('Error', 'Could not show paywall. ' + errorMsg);
        }
        return null;
    }
};

/**
 * Shows the RevenueCat Customer Center for managing subscriptions.
 */
export const presentCustomerCenter = async () => {
    if (!isConfigured || isServer) return;
    
    if (isExpoGo) {
        Alert.alert('Development Build Required', 'Customer Center requires a Development Build.');
        return;
    }

    try {
        await RevenueCatUI.presentCustomerCenter();
    } catch (error: any) {
        console.error('Error presenting Customer Center:', error);
        Alert.alert('Error', 'Could not open subscription management.');
    }
};

/**
 * Restores previous purchases for the user.
 */
export const restorePurchases = async (): Promise<CustomerInfo | null> => {
    if (!isConfigured || isServer) return null;
    try {
        const customerInfo = await Purchases.restorePurchases();
        
        // Check if the specific entitlement is active after restore
        const hasEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
        
        if (hasEntitlement) {
            Alert.alert('Purchases Restored', 'Your premium access has been successfully restored.');
        } else {
            Alert.alert(
                'No Purchases Found', 
                'Restore successful, but no active subscription for "' + ENTITLEMENT_ID + '" was found on this account. If you are in development, ensure your sandbox account has a valid purchase.'
            );
        }
        return customerInfo;
    } catch (e: any) {
        Alert.alert('Restore Failed', e.message || 'Could not restore purchases.');
        return null;
    }
};

