// pages/api/login.js
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  try {
    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!backendRes.ok) {
      const errorData = await backendRes.json();
      res.status(backendRes.status).json(errorData); // Forward the exact error from the backend
    } else {
      const data = await backendRes.json();
      res.status(200).json(data); // Forward the response from the backend
    }
  } catch (error) {
    res.status(500).json({ message: 'An unknown error occurred' });
  }
}