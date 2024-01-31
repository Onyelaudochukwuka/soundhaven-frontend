import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const backendRes = await fetch('http://your-backend-url.com/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${req.headers.authorization}`, // Forward the authorization token
                },
                body: JSON.stringify(req.body),
            });

            res.status(200).json({ message: 'Logged out successfully' });
        } catch (error) {
            if (error instanceof Error) {
                res.status(500).json({ message: error.message });
            } else {
                // If it's not an Error instance or doesn't have a message property
                res.status(500).json({ message: 'An unknown error occurred' });
            }
        }
    }
}