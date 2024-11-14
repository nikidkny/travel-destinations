import { axiosInstance } from '../utils/axiosConfig.ts';

interface Destination {
  location: string;
  country: string;
  description: string;
  date_start: string;
  date_end: string;
  image?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

// Function to create a destination
export async function createDestination(destination: Destination): Promise<ApiResponse> {
  try {
    const response = await axiosInstance.post('/destination', destination);

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error creating destination:', error);

    if (error.response && error.response.status === 401) {
      return { success: false, message: 'Unauthorized: Please log in' };
    }

    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create destination',
    };
  }
}

export async function updateDestination(
  destinationId: string,
  updatedData: Partial<Destination>,
): Promise<ApiResponse> {
  try {
    const response = await axiosInstance.patch(`/destination/${destinationId}`, updatedData);

    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: any) {
    console.error('Error updating destination:', error);

    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update destination',
    };
  }
}

export async function getDestinationById(destinationId: string): Promise<Destination | null> {
  try {
    const response = await axiosInstance.get(`/destination/get/${destinationId}`);
    console.log(response);
    if (response.data) {
      return response.data;
    } else {
      console.error(response.data.message);
      return null;
    }
  } catch (error: any) {
    console.error('Error fetching destination:', error);
    return null;
  }
}
