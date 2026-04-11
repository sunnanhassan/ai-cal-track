import { Platform } from 'react-native';

export interface UserOnboardingData {
  gender?: string;
  goal?: string;
  workoutFrequency?: string;
  birthDate?: string;
  height?: string;
  weight?: string;
}

export interface GeneratedFitnessPlan {
  dailyCalories: number;
  macros: {
    proteinGrams: number;
    carbsGrams: number;
    fatsGrams: number;
  };
  waterIntakeLiters: number;
  fitnessSummary: string;
}

// Runtime Validation Guard
function validateFitnessPlan(data: any): data is GeneratedFitnessPlan {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.dailyCalories !== 'number') return false;
  if (typeof data.waterIntakeLiters !== 'number') return false;
  if (typeof data.fitnessSummary !== 'string') return false;
  
  const macros = data.macros;
  if (!macros || typeof macros !== 'object') return false;
  if (typeof macros.proteinGrams !== 'number') return false;
  if (typeof macros.carbsGrams !== 'number') return false;
  if (typeof macros.fatsGrams !== 'number') return false;
  
  return true;
}

export async function generateFitnessPlan(userData: UserOnboardingData): Promise<GeneratedFitnessPlan> {
  const prompt = `
    You are an expert fitness and nutrition AI coach. 
    I need you to generate a personalized daily fitness plan including daily calories, macronutrient breakdown in grams, daily water intake in liters, and a short summary/tips section based on the following user profile:

    Gender: ${userData.gender}
    Goal: ${userData.goal}
    Workout Frequency: ${userData.workoutFrequency}
    Birth Date: ${userData.birthDate}
    Height: ${userData.height} feet
    Weight: ${userData.weight} kg

    Respond strictly with a JSON object in the following format, with no markdown formatting or extra text:
    {
      "dailyCalories": 2500,
      "macros": {
        "proteinGrams": 150,
        "carbsGrams": 250,
        "fatsGrams": 80
      },
      "waterIntakeLiters": 3.5,
      "fitnessSummary": "A short, encouraging 2-3 sentence summary about their plan."
    }
  `;

  try {
    const isLocal = process.env.NODE_ENV === 'development';
    const baseUrl = process.env.EXPO_PUBLIC_API_URL || 
        (Platform.OS === 'android' ? 'http://10.0.2.2:8081' : 'http://localhost:8081');
    
    const response = await fetch(`${baseUrl}/api/gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
    }

    const json = await response.json();
    const jsonString = json.text;
    
    if (!jsonString) {
      if (isLocal) console.error('Gemini returned an empty structure (redacted body)');
      throw new Error('Invalid response format from Gemini API endpoint');
    }

    const cleanJsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();

    // Redacted server logging in Production
    if (isLocal) {
        console.log(`[DEBUG] Gemini Response Length: ${cleanJsonString.length} bytes`);
    }

    const parsedData = JSON.parse(cleanJsonString);
    
    if (!validateFitnessPlan(parsedData)) {
      if (isLocal) console.error('[DEBUG] Validation failed for structure keys');
      throw new Error('Received malformed fitness plan schema from AI');
    }
    
    return parsedData;

  } catch (error: any) {
    console.error('Error executing fitness generation handler: ', error.message);
    throw error;
  }
}

export interface FoodNutritionData {
  foodName: string;
  servingSize: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
}

export async function analyzeFoodImage(base64Image: string): Promise<FoodNutritionData> {
  const prompt = `
    You are an expert AI food analyst. Analyze the provided image of food.
    Identify the dish or food item, and estimate its nutritional values for a standard serving size visible or typically associated with it.
    
    Respond strictly with a JSON object in the exact following format, with no markdown formatting or extra text:
    {
      "foodName": "Name of the dish/food",
      "servingSize": "e.g., 1 bowl (300g)",
      "calories": "450",
      "protein": "25.0",
      "fat": "15.5",
      "carbs": "40.2"
    }

    If the image does not contain food, or you cannot identify it, provide your best reasonable guess of any visible organic matter or return 0s for macros and unknown for foodName.
  `;

  try {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY in environment");
    }

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-1.5-flash'
    ];

    let response;
    let success = false;
    let lastErrorText = '';

    for (const model of modelsToTry) {
      if (success) break;
      
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      // Try each model up to 2 times if it hits a 503 (High Traffic)
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          response = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                contents: [{
                  parts: [
                    { text: prompt },
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
                  ]
                }],
                generationConfig: {
                  temperature: 0.2,
                  responseMimeType: 'application/json'
                }
              }),
          });
          
          if (response.ok) {
             success = true;
             break; // Break retry loop
          } else {
             lastErrorText = await response.text();
             console.log(`Model ${model} (Attempt ${attempt}) failed: ${response.status} - ${lastErrorText.substring(0, 100)}...`);
             
             if (response.status === 503) {
               // Temporary traffic spike. Wait 2 seconds and retry this exact model!
               await new Promise(res => setTimeout(res, 2000));
               continue; 
             } else if (response.status === 429) {
               // Quota fully exhausted (Limit=0), no point in retrying this model.
               break; 
             } else {
               // Other error (400, 404), go to next model
               break;
             }
          }
        } catch (err: any) {
           console.warn(`Fetch natively failed for ${model}:`, err.message);
           break;
        }
      }
    }

    if (!success || !response) {
      console.error('All Google AI Models Exhausted.');
      throw new Error(`Google API returned 503 (High Traffic) or 429 (Quota). Please try again later.`);
    }

    const json = await response.json();
    const jsonString = json.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonString) {
      throw new Error('Invalid response format from Gemini API endpoint');
    }

    const cleanJsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJsonString);
    
    // Convert numbers to strings matching the SelectedFoodParsed interface
    return {
      foodName: parsedData.foodName || 'Unknown Food',
      servingSize: parsedData.servingSize || '1 serving',
      calories: parsedData.calories?.toString() || '0',
      protein: parsedData.protein?.toString() || '0',
      fat: parsedData.fat?.toString() || '0',
      carbs: parsedData.carbs?.toString() || '0'
    };

  } catch (error: any) {
    console.error('Error executing image analysis: ', error.message);
    throw error;
  }
}

