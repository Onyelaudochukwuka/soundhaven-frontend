export const fetchWithToken = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('token');
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  };