import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    // Attempt to read the private key. Fallback to public just during migration if user hasn't updated their .env
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error('Server Configuration Error: Missing Gemini API Key');
      return Response.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return Response.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      }
    });

    return Response.json({ text: response.text });
  } catch (error: any) {
    console.error('Server Gemini Error: Failed model execution', error.message);
    return Response.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
