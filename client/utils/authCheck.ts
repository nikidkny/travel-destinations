import { axiosInstance } from './axiosConfig.ts';

export const checkAuth = async (): Promise<boolean> => {
  try {
    const response = await axiosInstance.get('/auth/status');

    if (!response.data.authenticated) {
      // Redirect to login page if not authenticated
      window.location.href = '/login.html';
    }
    return true;
  } catch (error) {
    alert('Authentication Error: You need to log in to access this feature');
    console.error('Error checking authentication status:', error);
    // Redirect to login on error as a fallback
    window.location.href = '/index.html';
    return false;
  }
};

// Check if user is logged in based on 'isLoggedIn' in local storage
export const checkUserLoggedIn = () => {
  return localStorage.getItem('isLoggedIn') === 'true';
};
