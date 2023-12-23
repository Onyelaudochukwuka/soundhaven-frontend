const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json() as { message: string };
    throw new Error(errorData.message || 'Network response was not ok');
  }
  return response.json();
};

export const fetchTracks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tracks`);
    return await handleResponse(response);
  } catch (error: any) { // Type assertion for error
    console.error('Error fetching tracks:', error.message);
    throw error;
  }
};

export const uploadTrack = async (file: File) => {
  const formData = new FormData();
  formData.append('track', file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    return await handleResponse(response);
  } catch (error: any) { // Type assertion for error
    console.error('Error uploading track:', error.message);
    throw error;
  }
};
