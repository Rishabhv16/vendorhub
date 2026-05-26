import { NextRequest, NextResponse } from 'next/server';

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama3-8b-8192';

export async function POST(req: NextRequest) {
  try {
    const { productName, category, keyFeatures } = await req.json();
    if (!productName) return NextResponse.json({ error: 'Missing product name' }, { status: 400 });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });

    const prompt = `You are a product copywriter for an Indian hyperlocal e-commerce marketplace.

Write a compelling product description for:
Product: "${productName}"
Category: ${category || 'General'}
Key features: ${keyFeatures || 'Not specified'}

Requirements:
- 2-3 sentences max
- Engaging and benefits-focused
- Suitable for Indian buyers
- No price mentions
- End with a strong value proposition

Respond with ONLY the description text, no quotes, no JSON.`;

    const res = await fetch(GROQ_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!res.ok) throw new Error('Groq API error');

    const data = await res.json();
    const description = data.choices[0]?.message?.content?.trim() || '';
    return NextResponse.json({ description });
  } catch (err: any) {
    console.error('Description gen error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
