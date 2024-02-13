// pages/api/comments.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { Comment } from '../../../types/types';

type ErrorResponse = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Comment[] | Comment | ErrorResponse>
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      await fetchComments(req, res);
      break;
    case 'POST':
      await addComment(req, res);
      break;
    case 'PATCH':
      await editComment(req, res);
      break;
    case 'DELETE':
      await deleteComment(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

async function fetchComments(
  req: NextApiRequest,
  res: NextApiResponse<Comment[] | ErrorResponse>
) {
  const { trackId, page = 1, limit = 10 } = req.query; // Set default values

  try {
    const response = await fetch(`http://localhost:3122/comments?trackId=${trackId}`);
    if (!response.ok) {
      throw new Error(`Error fetching comments: ${response.statusText}`);
    }
    const data: Comment[] = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function addComment(
  req: NextApiRequest,
  res: NextApiResponse<Comment | ErrorResponse>
) {
  const { trackId, userId, text } = req.body;

  try {
    const response = await fetch(`http://localhost:3122/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId, userId, text }),
    });
    if (!response.ok) {
      throw new Error(`Error posting comment: ${response.statusText}`);
    }
    const data: Comment = await response.json();
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function editComment(
  req: NextApiRequest,
  res: NextApiResponse<Comment | ErrorResponse>
) {
  const { id } = req.query;
  const { text } = req.body;

  try {
    // Should change to ${commentId}
    const response = await fetch(`http://localhost:3122/${Id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      throw new Error(`Error editing comment: ${response.statusText}`);
    }
    const data: Comment = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteComment(
  req: NextApiRequest,
  res: NextApiResponse<{} | ErrorResponse>
) {
  const { id } = req.query;

  try {
    const response = await fetch(`http://localhost:3000/api/comments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error deleting comment: ${response.statusText}`);
    }
    res.status(204).end();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
