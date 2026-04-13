exports.handler = async function (event) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            },
            body: '',
        };
    }

    try {
        const { prompt } = JSON.parse(event.body);

        // ── Call OpenAI ──────────────────────────────────────────
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,  // set in Netlify env vars
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp:free',           // Free OpenRouter Gemini model
                max_tokens: 4000,
                temperature: 0.7,
                response_format: { type: 'json_object' }, // forces pure JSON — no stripping needed
                messages: [
                    {
                        role: 'system',
                        content: 'You are a travel planning assistant. Always respond with valid JSON only. No markdown, no explanation, no code fences.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            }),
        });

        const data = await res.json();

        // Forward HTTP errors back to frontend
        if (!res.ok) {
            console.error('OpenAI error:', data);
            return {
                statusCode: res.status,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: data.error?.message || 'OpenAI error' }),
            };
        }

        // Parse the JSON content from OpenAI response
        const raw = data.choices?.[0]?.message?.content;
        if (!raw) {
            return {
                statusCode: 500,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'No content in OpenAI response' }),
            };
        }

        // response_format: json_object guarantees clean JSON — but strip fences just in case
        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(parsed),
        };

    } catch (err) {
        console.error('Function error:', err);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: err.message }),
        };
    }
};