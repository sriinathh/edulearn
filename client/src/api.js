// src/api/api.js

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${backendUrl}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Add more API calls similarly...
