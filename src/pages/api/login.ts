import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    if (!backendRes.ok) {
      // More detailed logging of backend response
      const errorData = await backendRes.json();
      console.error('Backend error:', errorData); // Log error for debugging
      res.status(backendRes.status).json({ message: 'Error from backend', details: errorData });
    } else {
      const data = await backendRes.json();
      res.status(200).json(data); // Forward the response from the backend
    }
  } catch (error) {
    // More detailed error handling and logging
    console.error('Request failed:', error); // Log error for debugging
    res.status(500).json({ message: 'An unknown error occurred', error: error.message });
  }
}
