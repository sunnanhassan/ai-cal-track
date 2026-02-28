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
