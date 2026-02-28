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

export async function generateFitnessPlan(userData: UserOnboardingData): Promise<GeneratedFitnessPlan> {
  const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  if (!GEMINI_API_KEY) {
    throw new Error('Missing Expo Public Gemini API Key');
  }

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
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2, // Low temperature for more deterministic output
          responseMimeType: 'application/json',
        }
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Extract the JSON string from the Gemini response structure
    const jsonString = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonString) {
      console.error('Gemini returned an empty structure:', data);
      throw new Error('Invalid response format from Gemini API');
    }

    // Sometimes Gemini wraps the JSON in markdown code blocks even when told not to. 
    // We clean it here before parsing to prevent crash loops.
    const cleanJsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();

    console.log("Cleaned Gemini Response:", cleanJsonString);
    const fitnessPlan = JSON.parse(cleanJsonString) as GeneratedFitnessPlan;
    
    return fitnessPlan;

  } catch (error) {
    console.error('Error generating fitness plan from Gemini: ', error);
    throw error;
  }
}
