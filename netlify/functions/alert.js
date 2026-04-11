exports.handler = async (event) => {
    const { phone } = JSON.parse(event.body);
    const response = await fetch('https://api.pushbullet.com/v2/pushes', {
        method: 'POST',
        headers: {
            'Access-Token': process.env.PUSHBULLET_TOKEN,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            type: 'note',
            title: 'SANCHARAM SOS',
            body: `Emergency alert — contact: ${phone}`
        })
    });
    return { statusCode: response.ok ? 200 : 500 };
};
