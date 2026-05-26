import { NextRequest, NextResponse } from 'next/server';

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama3-8b-8192'; // Fast & capable

export async function POST(req: NextRequest) {
  try {
    const { productName, category, description, existingProducts } = await req.json();
    if (!productName || !category) {
      return NextResponse.json({ error: 'Missing product details' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI not configured' }, { status: 500 });

    // Build context from existing platform products in the same category
    const similar = (existingProducts || [])
      .filter((p: any) => p.category === category)
      .slice(0, 8)
      .map((p: any) => `- ${p.name}: ₹${p.price}`)
      .join('\n');

    const prompt = `You are a pricing expert for an Indian hyperlocal e-commerce platform.

Product to price: "${productName}"
Category: ${category}
Description: ${description || 'Not provided'}

Similar products already on the platform:
${similar || 'No similar products yet'}

Based on the product details and market context, suggest:
1. A recommended price in INR (Indian Rupees)
2. A minimum price (floor)
3. A maximum price (ceiling)
4. One sentence explaining the pricing rationale

Respond ONLY in this exact JSON format, no extra text:
{"recommended": 1299, "min": 999, "max": 1799, "rationale": "Your reason here"}`;

    const res = await fetch(GROQ_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Groq API error');
    }

    const data = await res.json();
    const text = data.choices[0]?.message?.content || '';

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');
    const suggestion = JSON.parse(jsonMatch[0]);

    return NextResponse.json(suggestion);
  } catch (err: any) {
    console.error('Price suggestion error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
