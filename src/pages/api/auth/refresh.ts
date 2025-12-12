import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { api } from '../../../lib/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Call the backend refresh endpoint
    const response = await api.post('/auth/refresh', {
      refresh_token,
    });

    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ 
      message: error.response?.data?.message || 'Failed to refresh token' 
    });
  }
}