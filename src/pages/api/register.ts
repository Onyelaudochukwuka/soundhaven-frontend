import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === 'POST') {
        // Forward the request to the backend's registration endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            // Extract error message from response and send it to the frontend
            const errorData = await response.json();
            res.status(response.status).json({ message: errorData.message || 'Registration failed' });
            return;
        }

        // Handle the response and return it to the frontend
        const data = await response.json();
        res.status(200).json(data);
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}
