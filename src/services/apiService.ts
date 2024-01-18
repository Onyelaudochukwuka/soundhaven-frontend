import { Track, Album, Artist } from '@/types';

if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
  throw new Error("Backend URL is not defined in .env.local");
}
export const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string;

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error response:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
    });

    let errorMessage = errorData.message || 'Network response was not ok';
    throw new Error(errorMessage);
  }
  return response.json();
};

// Auth functionality
export const register = async (name: string, email: string, password: string) => {
  try {
    const response = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return await handleResponse(response);
  } catch (error: any) {
    console.error('Error during registration:', error.message);
    throw error;
  }
};


export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await handleResponse(response);
  } catch (error: any) {
    console.error('Error during login:', error.message);
    throw error;
  }
};

export const logout = async () => {
  const token = getToken();
  try {
    const response = await fetch(`${backendUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // Include the JWT token here
      },
    });
    return await handleResponse(response);
  } catch (error: any) {
    console.error('Error during logout:', error.message);
    throw error;
  }
};

export const deleteAccount = async (userId: number) => {
  const token = getToken();
  try {
    const response = await fetch(`${backendUrl}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`, // Include the JWT token here
      },
    });
    return await handleResponse(response);
  } catch (error: any) {
    console.error(`Error deleting account for user ID ${userId}:`, error.message);
    throw error;
  }
};

const getToken = () => {
  // Retrieve the JWT token from localStorage
  const token = localStorage.getItem('token');
  return token || '';  // Return the token, or an empty string if it's not found
};

// Track functionality
export const fetchTracks = async () => {
  try {
    const response = await fetch(`${backendUrl}/tracks`);
    return await handleResponse(response);
  } catch (error: any) { // Type assertion for error
    console.error('Error fetching tracks:', error.message);
    throw error;
  }
};

export const uploadTrack = async (formData: FormData) => {
  console.log("Preparing to upload file");

  // Log the contents of formData for debugging
  // Convert formData keys to an array and log them
  const formDataKeys = Array.from(formData.keys());
  for (let key of formDataKeys) {
    console.log(key, formData.get(key));
  }

  try {
    console.log("Sending upload request to server");
    const response = await fetch(`${backendUrl}/tracks/upload`, {
      method: 'POST',
      body: formData,
    });

    console.log("Received response from upload request", response);

    if (!response.ok) {
      console.error('Response status:', response.status);
      const errorData = await response.json();
      console.error('Response error data:', errorData);
      throw new Error(errorData.message || 'Error uploading track');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error uploading track:', error.message);
    throw error;
  }
};

export const deleteTrack = async (id: number) => {
  try {
    const response = await fetch(`${backendUrl}/tracks/${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  } catch (error: any) {
    console.error(`Error deleting track with ID ${id}:`, error.message);
    // Log additional error details if available
    if (error instanceof Error && error.message.includes('Track not found')) {
      console.error(`Track with ID ${id} not found.`);
    }
    throw error;
  }
};

// Metadata functionality
export const updateTrackMetadata = async (trackId: number, updatedData: Partial<Track>) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string;
  const response = await fetch(`${backendUrl}/tracks/${trackId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error updating track');
  }

  return response.json();
};


// Artists and albums functionality
export const fetchArtists = async (): Promise<Artist[]> => {
  const response = await fetch(`${backendUrl}/artists`);
  return handleResponse(response);
};

export const fetchAlbums = async (): Promise<Album[]> => {
  const response = await fetch(`${backendUrl}/albums`);
  return handleResponse(response);
};

export const createArtist = async (artistData: Partial<Artist>): Promise<Artist> => {
  const response = await fetch(`${backendUrl}/artists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(artistData),
  });
  return handleResponse(response);
};

export const createAlbum = async (albumData: Partial<Album>): Promise<Album> => {
  const response = await fetch(`${backendUrl}/albums`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(albumData),
  });
  return handleResponse(response);
};

// Comment functionality
export const addComment = async (trackId: number, userId: number, text: string) => {
  try {
    const response = await fetch(`${backendUrl}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId, userId, text }),
    });
    return handleResponse(response);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error adding comment:', error.message);
    }
    throw error;
  }
};

export const editComment = async (commentId: number, text: string) => {
  try {
    const response = await fetch(`${backendUrl}/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return handleResponse(response);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error editing comment:', error.message);
    }
    throw error;
  }
};

export const deleteComment = async (commentId: number) => {
  try {
    const response = await fetch(`${backendUrl}/comments/${commentId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  } catch (error: unknown) {
    if
      (error instanceof Error) {
      console.error('Error deleting comment:', error.message);
    }
    throw error;
  }
};