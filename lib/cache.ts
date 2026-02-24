import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
export interface TokenCache {
  getToken: (key: string) => Promise<string | undefined | null>
  saveToken: (key: string, token: string) => Promise<void>
  clearToken?: (key: string) => void
}

const createTokenCache = (): TokenCache => {
  return {
    getToken: async (key: string) => {
      try {
        const item = await SecureStore.getItemAsync(key)
        if (item) {
          if (process.env.NODE_ENV !== 'production') {
            console.log(`${key} was read from SecureStore 🔐 \n`)
          }
        } else {
          if (process.env.NODE_ENV !== 'production') {
            console.log('No values stored under key: ' + key)
          }
        }
        return item
      } catch (error) {
        console.error('secure store get item error: ', error)
        await SecureStore.deleteItemAsync(key)
        return null
      }
    },
    saveToken: (key: string, token: string) => {
      return SecureStore.setItemAsync(key, token)
    },
  }
}

// SecureStore is not supported on the web
export const tokenCache = Platform.OS !== 'web' ? createTokenCache() : undefined
