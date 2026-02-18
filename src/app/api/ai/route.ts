import { NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { prompt, context } = body;

        console.log("AI Request:", { prompt, contextLength: context?.length });

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const friendlyPrompt = `${prompt} \n\n(IMPORTANT: Respond in a very friendly, enthusiastic tone and use emojis! 🎓✨)`;

        const result = await generateContent(friendlyPrompt, context);
        console.log("AI Result:", result.substring(0, 50) + "...");

        return NextResponse.json({ result });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
