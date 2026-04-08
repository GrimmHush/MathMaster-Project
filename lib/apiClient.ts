// lib/apiClient.ts
let accessToken: string | null = null;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  let response = await fetch(`http://localhost:4000${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...options.headers,
    },
  });

  // Silent Refresh Logic
  if (response.status === 401) {
    const refreshRes = await fetch('http://localhost:4000/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include' // Sends the httpOnly cookie
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setAccessToken(data.accessToken);
      
      // Retry original request
      response = await fetch(`http://localhost:4000${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.accessToken}`,
          ...options.headers,
        },
      });
    } else {
      // Refresh failed, prompt login without breaking current game loop
      console.warn("Session expired. Guest mode active.");
    }
  }

  return response;
};