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

        // ── Call Native Google Gemini ─────────────────────────────────────────
        const API_KEY = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY; // Using existing env or new one
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "You are a travel planning assistant. Always respond with valid JSON only. No markdown, no explanation.\n\n" + prompt 
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json"
                }
            }),
        });

        const data = await res.json();

        // Forward HTTP errors back to frontend
        if (!res.ok) {
            console.error('Gemini error:', data);
            return {
                statusCode: res.status,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: data.error?.message || 'Gemini API error' }),
            };
        }

        // Parse the JSON content from Gemini response
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!raw) {
            return {
                statusCode: 500,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'No content in Gemini response' }),
            };
        }

        // responseMimeType guarantees JSON, but strip any markdown fences just in case
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