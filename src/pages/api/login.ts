// pages/api/login.js
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const backendRes = await fetch('http://your-backend-url.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });

      if (!backendRes.ok) {
        throw new Error('Failed to log in');
      }

      const data = await backendRes.json();
      res.status(200).json(data); // Forward the response from the backend
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
