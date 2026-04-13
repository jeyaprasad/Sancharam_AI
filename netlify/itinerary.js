export default async (req) => {
    try {
        const { prompt } = await req.json();

        const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 4000,
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        const data = await res.json();
        const raw = data.content?.[0]?.text;

        if (!raw) return Response.json({ error: 'No response from AI' }, { status: 500 });

        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned);

        return Response.json(parsed);

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
};

export const config = { path: '/api/itinerary' };