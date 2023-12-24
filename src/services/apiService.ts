if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
  throw new Error("Backend URL is not defined in .env.local");
}
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string;

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json() as { message: string };
    throw new Error(errorData.message || 'Network response was not ok');
  }
  return response.json();
};

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
    const response = await fetch(`${backendUrl}/tracks/uploads`, {
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
