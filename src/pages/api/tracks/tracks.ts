// pages/api/tracks.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      res.status(200).json({ message: 'Fetching tracks' });
      break;
    case 'POST':
      res.status(201).json({ message: 'Track uploaded' });
      break;
    case 'DELETE':
      res.status(200).json({ message: 'Track deleted' });
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
