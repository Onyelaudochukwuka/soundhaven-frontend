// pages/api/tracks/[trackId].ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { trackId } = req.query;
  const { method } = req;

  switch (method) {
    case 'GET':
      // Logic to fetch a specific track by trackId
      res.status(200).json({ message: `Fetching track with ID: ${trackId}` });
      break;

    case 'PUT':
      // Logic to update a specific track by trackId
      res.status(200).json({ message: `Updating track with ID: ${trackId}` });
      break;

    case 'DELETE':
      // Logic to delete a specific track by trackId
      res.status(200).json({ message: `Deleting track with ID: ${trackId}` });
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
