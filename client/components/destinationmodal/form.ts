import {
  getDestinationById,
  createDestination,
  updateDestination,
} from '../../service/destinationApi';
import { uploadImage } from '../../storage';
import { hideModal, isCreateMode, currentDestinationId, destinationModal } from './index';
import { showPopup, initializePopup } from '../customAlert';
import { COUNTRIES } from '../../utils/countries';
import { refreshDestinations } from '../../utils/populate';

interface FormData {
  location: string;
  country: string;
  startDate: string;
  endDate: string;
}

export const resetForm = () => {
  const form = document.getElementById('destinationForm') as HTMLFormElement;
  if (form) form.reset();

  const currentImagePreview = document.getElementById('current-image-preview') as HTMLImageElement;
  if (currentImagePreview) {
    currentImagePreview.src = '';
    currentImagePreview.classList.add('hidden');
  }

  const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
  if (descriptionInput) {
    descriptionInput.style.height = 'auto';
  }
};

export const populateForm = async (destinationId: string) => {
  try {
    console.log(destinationId);
    const destination = await getDestinationById(destinationId);

    if (destination) {
      const countryInput = document.getElementById('country') as HTMLSelectElement;
      const locationInput = document.getElementById('location') as HTMLInputElement;
      const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
      const startDateInput = document.getElementById('datepicker-start') as HTMLInputElement;
      const endDateInput = document.getElementById('datepicker-end') as HTMLInputElement;
      const currentImagePreview = document.getElementById(
        'current-image-preview',
      ) as HTMLImageElement;

      countryInput.value = destination.country;
      locationInput.value = destination.location;
      descriptionInput.value = destination.description;
      startDateInput.value = formatDateForInput(destination.date_start);
      endDateInput.value = formatDateForInput(destination.date_end);

      if (destination.image) {
        currentImagePreview.src = destination.image;
        currentImagePreview.classList.remove('hidden');
      } else {
        currentImagePreview.classList.add('hidden');
      }

      requestAnimationFrame(() => {
        adjustTextareaHeight(descriptionInput);
      });
    } else {
      showPopup('Error', 'Unable to find the destination. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Error populating form with destination data:', error);
    showPopup(
      'Error',
      'An error occurred while fetching the destination data. Please try again.',
      'error',
    );
  }
};

const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;

  const maxHeight = 180;
  if (textarea.scrollHeight > maxHeight) {
    textarea.style.height = `${maxHeight}px`;
    textarea.style.overflowY = 'auto';
  } else {
    textarea.style.overflowY = 'hidden';
  }
};

document.addEventListener('DOMContentLoaded', function () {
  initializePopup();
  const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;

  if (descriptionInput) {
    descriptionInput.style.height = 'auto';
    adjustTextareaHeight(descriptionInput);
    descriptionInput.addEventListener('input', () => adjustTextareaHeight(descriptionInput));
  }
});

export const formatDateForInput = (isoDate: string): string => {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const populateCountryDropdown = async () => {
  const countrySelect = document.getElementById('country') as HTMLSelectElement;
  try {
    COUNTRIES.forEach((country) => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating countries:', error);
  }
};

export const validateForm = (formData: FormData): { valid: boolean; message: string } => {
  if (!formData.location || !formData.country) {
    return { valid: false, message: 'Location and country are required' };
  }

  if (new Date(formData.endDate) < new Date(formData.startDate)) {
    return { valid: false, message: 'End date cannot be before start date' };
  }

  return { valid: true, message: 'Form is valid' };
};

export const handleFormSubmission = async (e: Event) => {
  e.preventDefault();

  const country = (document.getElementById('country') as HTMLSelectElement).value;
  const location = (document.getElementById('location') as HTMLInputElement).value;
  const description = (document.getElementById('description') as HTMLTextAreaElement).value;
  const startDate = (document.getElementById('datepicker-start') as HTMLInputElement).value;
  const endDate = (document.getElementById('datepicker-end') as HTMLInputElement).value;
  const currentSrc = (document.getElementById('current-image-preview') as HTMLImageElement).src;
  const image = (document.getElementById('image-upload') as HTMLInputElement).files?.[0];

  const formData: FormData = { country, location, startDate, endDate };
  const validation = validateForm(formData);
  if (!validation.valid) {
    showPopup('Validation Error', validation.message, 'error');
    return;
  }

  let imageUrl = currentSrc.includes('tempdevstorageaccount.blob.core.windows.net')
    ? currentSrc
    : './placeholder-img.png';

  if (image) {
    try {
      const imageUploadResponse = await uploadImage(image);
      if (imageUploadResponse.success) {
        imageUrl = imageUploadResponse.url;
      } else {
        showPopup(
          'Image Upload Failed',
          'Image upload failed: ' + imageUploadResponse.message,
          'error',
        );
        return;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showPopup('Error', 'An error occurred during image upload.', 'error');
      return;
    }
  }

  const destinationData = {
    country,
    location,
    description,
    date_start: startDate,
    date_end: endDate,
    image: imageUrl,
  };

  try {
    let response;
    if (isCreateMode) {
      response = await createDestination(destinationData);
    } else if (currentDestinationId) {
      response = await updateDestination(currentDestinationId, destinationData);
    }

    if (response && response.success) {
      showPopup(
        'Success',
        isCreateMode ? 'Destination added successfully!' : 'Destination updated successfully!',
        'success',
      );
      (e.target as HTMLFormElement).reset();
      hideModal();

      await refreshDestinations();

      destinationModal();
    } else {
      showPopup('Error', 'Failed to save destination: ' + response?.message, 'error');
    }
  } catch (error) {
    console.error('Error saving destination:', error);
    showPopup('Error', 'An error occurred. Please try again.', 'error');
  }
};
