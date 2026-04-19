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
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY in environment");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API returned ${response.status}: ${errorText}`);
    }

    const json = await response.json();
    const jsonString = json.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonString) throw new Error('Empty response from AI');

    const cleanJsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJsonString);
    
    if (!validateFitnessPlan(parsedData)) {
      throw new Error('Received malformed fitness plan schema from AI');
    }
    
    return parsedData;

  } catch (error: any) {
    console.error('Error executing fitness generation: ', error.message);
    throw error;
  }
}



export interface BentoInsight {
  title: string;
  value: string;
  insight: string;
  type: 'success' | 'warning' | 'info' | 'error';
  icon: string; // Ionicons name
}

export async function generateBentoInsights(weeklyData: any[], weight: string): Promise<BentoInsight[]> {
  const prompt = `
    You are an expert health and performance AI coach with a supportive, professional, and sophisticated tone. 
    Analyze the following weekly health data and generate exactly 4-6 concise, highly impactful insights or status cards for a "Bento Grid" dashboard.
    
    Weekly Data (Last 7 Days):
    ${JSON.stringify(weeklyData)}
    
    Current Weight: ${weight} kg
    
    IMPORTANT GUIDELINES:
    1. Tone: Professional, encouraging, and data-driven. Avoid being overly critical.
    2. Missing Data: If logs are sparse (e.g., many zeros), do NOT just say "Incomplete". Use titles like "Analysis Pending" or "Coach Insight" and values like "Logging Goal".
    3. Advice: Provide actionable, sophisticated advice. Instead of "Drink water", say "Aim for consistent hydration to optimize metabolic rate."
    4. Types: Use "success" for good trends, "warning" for alerts, "info" for general tips/reminders, and "error" only for critical health gaps.

    For each insight, provide:
    1. A short title (e.g., "Metabolic Trend", "Hydration Status").
    2. A brief value or status (e.g., "Optimal", "Refining...", "+200 kcal").
    3. A single punchy, professional sentence of insight or advice.
    4. A type: "success", "warning", "info", or "error".
    5. A relevant Ionicons icon name (e.g., "analytics-outline", "leaf-outline", "water-outline").

    Respond strictly with a JSON array of objects, with no markdown formatting or extra text.
    Example Format:
    [
      {
        "title": "Water Intake",
        "value": "75%",
        "insight": "You're slightly below your hydration goal today. Drink 2 more glasses!",
        "type": "info",
        "icon": "water-outline"
      }
    ]
  `;

  try {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY in environment");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      }),
    });

    if (!response.ok) throw new Error(`Server returned ${response.status}`);

    const json = await response.json();
    const jsonString = json.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonString) throw new Error('Empty response from AI');

    const cleanJsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJsonString);

  } catch (error: any) {
    console.error('Error generating bento insights: ', error.message);
    // Return empty array on error to prevent UI crash
    return [];
  }
}

export interface FoodNutritionData {
  foodName: string;
  servingSize: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  fiber?: string;
  sugar?: string;
  addedSugar?: string;
  sugarAlcohols?: string;
  sodium?: string;
  cholesterol?: string;
  saturatedFat?: string;
  transFat?: string;
  polyunsaturatedFat?: string;
  monounsaturatedFat?: string;
  potassium?: string;
  calcium?: string;
  iron?: string;
  vitaminA?: string;
  vitaminC?: string;
  vitaminD?: string;
  healthAnalysis?: string;
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
      "carbs": "40.2",
      "fiber": "5.0",
      "sugar": "8.0",
      "addedSugar": "2.0",
      "sugarAlcohols": "0.5",
      "sodium": "450",
      "cholesterol": "40",
      "saturatedFat": "4.2",
      "transFat": "0.1",
      "polyunsaturatedFat": "1.2",
      "monounsaturatedFat": "2.5",
      "potassium": "300",
      "calcium": "150",
      "iron": "2.5",
      "vitaminA": "400",
      "vitaminC": "12",
      "vitaminD": "0",
      "healthAnalysis": "A 2-3 sentence analysis of this meal's nutritional impact, specific to the ingredients and portions visible."
    }

    If the image does not contain food, or you cannot identify it, provide your best reasonable guess of any visible organic matter or return 0s for macros and unknown for foodName.
  `;

  try {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY in environment");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API returned ${response.status}: ${errorText}`);
    }

    const json = await response.json();
    const jsonString = json.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonString) throw new Error('Empty response from AI');

    const cleanJsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJsonString);

  } catch (error: any) {
    console.error('Error analyzing food image: ', error.message);
    throw error;
  }
}

export interface QuickLogResult {
  name: string;
  type: 'food' | 'exercise';
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sugar?: number;
  addedSugar?: number;
  sugarAlcohols?: number;
  sodium?: number;
  cholesterol?: number;
  potassium?: number;
  calcium?: number;
  iron?: number;
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  saturatedFat?: number;
  transFat?: number;
  polyunsaturatedFat?: number;
  monounsaturatedFat?: number;
  healthAnalysis?: string;
  burnedCalories?: number;
  duration?: number;
}

export async function parseQuickLog(query: string): Promise<QuickLogResult> {
  const prompt = `
    You are an expert AI nutrition and fitness tracker. Analyze the following natural language query and return a structured JSON object.
    
    Query: "${query}"
    
    GUIDELINES:
    1. HIGH SPECIFICITY: If the user provides a weight or quantity (e.g. "half kg", "1 plate", "2 fillets"), you MUST calculate all nutritional values specifically for that exact amount.
    2. Determine if it is a food intake ("one apple", "chicken bowl") or an exercise ("running 30 mins", "pushups").
    3. For Food:
       - type: "food"
       - calories: Estimated kcal for the specific quantity
       - protein/fat/carbs/fiber/sugar/addedSugar/sugarAlcohols: Estimated grams (number) for the specific quantity
       - saturatedFat/transFat/polyunsaturatedFat/monounsaturatedFat: Estimated grams (number)
       - sodium/cholesterol/potassium/calcium/iron/vitaminC: Estimated mg (number)
       - vitaminA/vitaminD: Estimated IU (number)
       - healthAnalysis: A 2-3 sentence personal coach analysis of this specific meal choice, mentioning why it's good or what to watch out for based on the description and quantity provided. Keep it supportive and evidence-based.
    4. For Exercise:
       - type: "exercise"
       - calories/macros/micros: 0 (keep these 0 for food sum)
       - burnedCalories: Estimated kcal burned
       - duration: Estimated minutes (if mentioned, else 0)
       - healthAnalysis: A short, motivating sentence about this specific activity.
    
    Respond strictly with a JSON object in this format:
    {
      "name": "Clean short name",
      "type": "food" | "exercise",
      "calories": number,
      "protein": number,
      "fat": number,
      "carbs": number,
      "fiber": number,
      "sugar": number,
      "addedSugar": number,
      "sugarAlcohols": number,
      "sodium": number,
      "cholesterol": number,
      "potassium": number,
      "calcium": number,
      "iron": number,
      "vitaminA": number,
      "vitaminC": number,
      "vitaminD": number,
      "saturatedFat": number,
      "transFat": number,
      "polyunsaturatedFat": number,
      "monounsaturatedFat": number,
      "healthAnalysis": string,
      "burnedCalories": number,
      "duration": number
    }
  `;

  try {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY in environment");
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google API returned ${response.status}: ${errorText}`);
    }

    const json = await response.json();
    const jsonString = json.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!jsonString) throw new Error('Empty response from AI');

    const cleanJsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJsonString);

  } catch (error: any) {
    console.error('Error parsing quick log: ', error.message);
    throw error;
  }
}

