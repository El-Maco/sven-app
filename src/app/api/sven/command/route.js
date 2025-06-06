export async function POST(request) {
    console.log('API route hit - POST request received');

    try {
        const body = await request.json();
        console.log('Request body:', body);

        const { direction, duration } = body;

        console.log('Received command:', { direction, duration });

        const response = Response.json({
            success: true,
            message: `Sven moving ${direction} for ${duration}ms`,
            timestamp: new Date().toISOString()
        });

        // Add CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

        return response;
    } catch (error) {
        console.error('API Error:', error);
        const errorResponse = Response.json({
            success: false,
            error: error.message
        }, { status: 500 });

        // Add CORS headers to error response too
        errorResponse.headers.set('Access-Control-Allow-Origin', '*');
        errorResponse.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');

        return errorResponse;
    }
}

export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

export async function GET() {
    const response = Response.json({ message: 'API route is working' });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
}
