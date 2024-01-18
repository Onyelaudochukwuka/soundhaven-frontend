
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
    ) {
    if (req.method === 'POST') {
        // Forward the request to the backend's registration endpoint
        const response = await fetch('${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });

        // Handle the response and return it to the frontend
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}
