// pages/api/tracks/[trackId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { backendUrl } from '../../../services/apiService';

export default async function handler(
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
      // Useful for when we implement music recognition API, to replace all track data in one request
      // when a match is found.
      res.status(200).json({ message: `Updating track with ID: ${trackId}` });
      break;

      case 'PATCH':
        try {
          const response = await fetch(`${backendUrl}/tracks/${trackId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
          });
      
          if (!response.ok) {
            throw new Error(`Error updating track: ${response.status}`);
          }
      
          const updatedTrack = await response.json();
          res.status(200).json(updatedTrack);
        } catch (error: unknown) { // Note: `error` is typed as `unknown`
          console.error(error);
          // Check if `error` is an instance of `Error`
          if (error instanceof Error) {
            res.status(500).json({ message: error.message });
          } else {
            // Fallback error handling for non-Error objects
            res.status(500).json({ message: 'An unknown error occurred' });
          }
        }
        break;

    case 'DELETE':
      // Logic to delete a specific track by trackId
      res.status(200).json({ message: `Deleting track with ID: ${trackId}` });
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'PATCH', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
