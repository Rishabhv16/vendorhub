import { NextRequest, NextResponse } from 'next/server';

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama3-8b-8192';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ keywords: [query], intent: query });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ keywords: [query], intent: query });

    const prompt = `You are a search query enhancer for an Indian e-commerce marketplace.

User searched for: "${query}"

Your job:
1. Extract the core search intent
2. Generate related keywords/synonyms that should also match
3. Detect if it's a category, brand, or product search

Respond ONLY in this exact JSON format:
{"intent": "what user wants", "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"], "category": "Electronics|Fashion|Food|null"}

Examples:
- "laptop bag" → {"intent": "laptop carrying case", "keywords": ["laptop bag", "notebook carry case", "laptop sleeve", "computer bag", "laptop backpack"], "category": null}
- "wireless headphones" → {"intent": "bluetooth audio headphones", "keywords": ["wireless headphones", "bluetooth headphones", "earphones", "audio headset", "TWS"], "category": "Electronics"}
- "running shoes" → {"intent": "athletic footwear for running", "keywords": ["running shoes", "sports shoes", "sneakers", "athletic shoes", "jogging shoes"], "category": "Fashion"}`;

    const res = await fetch(GROQ_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 300,
      }),
    });

    if (!res.ok) throw new Error('Groq API error');

    const data = await res.json();
    const text = data.choices[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ keywords: [query], intent: query });

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('AI search error:', err);
    // Fallback: just return empty
    return NextResponse.json({ keywords: [''], intent: '' });
  }
}
