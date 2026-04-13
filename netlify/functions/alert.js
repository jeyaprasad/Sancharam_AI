exports.handler = async (event) => {
    const { phone, location } = JSON.parse(event.body);
    
    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    // Construct the SOS Alert Message
    const alertMessage = `🚨 *SANCHARAM SOS* 🚨\n\nEmergency alert triggered.\n*Guardian Contact:* \`${phone}\`\n*Coordinates:* \`${location || 'Unknown'}\``;
    
    try {
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: alertMessage,
                parse_mode: 'Markdown'
            })
        });
        return { statusCode: response.ok ? 200 : 500 };
    } catch(err) {
        return { statusCode: 500, body: err.message };
    }
};
