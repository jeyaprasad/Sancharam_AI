exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: body.prompt }] }] }) 
            }
        );
        
        const data = await res.json();
        return { 
            statusCode: res.status, 
            body: JSON.stringify(data) 
        };
    } catch (error) {
        console.error("Gemini function error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to communicate with AI provider" })
        };
    }
};
