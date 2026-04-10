import CryptoJS from 'crypto-js';
import { Alert } from 'react-native';

const CLIENT_ID = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_SECRET;

export interface FatSecretFood {
  food_id: string;
  food_name: string;
  food_type: string;
  food_url: string;
  food_description: string;
  brand_name?: string;
}

// RFC 3986 encoding (FatSecret explicitly requires this for OAuth 1.0a)
const encodeRFC3986 = (str: string) => {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
};

export const searchFood = async (query: string): Promise<FatSecretFood[]> => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('FatSecret client ID or secret is missing from .env');
    Alert.alert("Missing API Keys", "Your FatSecret API keys were not found in .env.");
    return [];
  }

  try {
    const httpMethod = 'GET';
    const baseUrl = 'https://platform.fatsecret.com/rest/server.api';

    // 1. Gather all parameters
    const params: Record<string, string> = {
      oauth_consumer_key: CLIENT_ID,
      oauth_nonce: Math.random().toString(36).substring(2) + Date.now().toString(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: '1.0',
      method: 'foods.search',
      search_expression: query,
      format: 'json',
      max_results: '5',
    };

    // 2. Sort parameters alphabetically by key
    const sortedKeys = Object.keys(params).sort();
    
    // 3. Create the parameter string: "key=value&key2=value2" (RFC encoded)
    const paramString = sortedKeys
      .map(k => `${encodeRFC3986(k)}=${encodeRFC3986(params[k])}`)
      .join('&');

    // 4. Construct the Base String
    const baseString = [
      httpMethod,
      encodeRFC3986(baseUrl),
      encodeRFC3986(paramString)
    ].join('&');

    // 5. Generate the Signature Key (Secret + "&" since there is no token secret)
    const signingKey = encodeRFC3986(CLIENT_SECRET) + '&';

    // 6. Compute HMAC-SHA1 and encode in Base64
    const signature = CryptoJS.HmacSHA1(baseString, signingKey).toString(CryptoJS.enc.Base64);

    // 7. Add signature to parameters
    params.oauth_signature = signature;

    // 8. Build final request URL with all query parameters
    const queryKeys = Object.keys(params);
    const queryString = queryKeys
      .map(k => `${encodeRFC3986(k)}=${encodeRFC3986(params[k])}`)
      .join('&');

    const finalUrl = `${baseUrl}?${queryString}`;

    const response = await fetch(finalUrl, {
      method: httpMethod,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
        console.error('FatSecret search failed:', await response.text());
        return [];
    }

    const data = await response.json();
    
    // FatSecret returns an error inside a 200 OK wrapper sometimes
    if (data.error) {
      console.error('FatSecret API Error:', data.error);
      Alert.alert("FatSecret API Error", `Code ${data.error.code}: ${data.error.message}`);
      return [];
    }

    if (!data?.foods?.food) {
      console.log('FatSecret returned no foods for query:', query, 'Data:', data);
      return [];
    }

    const foods = data.foods.food;
    return Array.isArray(foods) ? foods : [foods];
  } catch (error) {
    console.error('Error searching FatSecret via OAuth1.0:', error);
    Alert.alert("Request Failed", "Could not reach FatSecret servers.");
    return [];
  }
};
