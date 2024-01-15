// pages/api/tracks/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const backendApiUrl = process.env.BACKEND_API_URL; 

  if (!backendApiUrl) {
    res.status(500).json({ message: "Backend API URL is not configured" });
    return;
  }

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
    return;
  }

  const apiUrl = `${backendApiUrl}/tracks`; // Endpoint to get all tracks

  try {
    const response = await fetch(apiUrl, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const tracks = await response.json();
    res.status(200).json(tracks);
  } catch (error) {
    console.error(`Error fetching tracks:`, error);
    res.status(500).json({ message: `Error fetching tracks` });
  }
}
