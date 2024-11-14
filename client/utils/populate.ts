import { type Destination as DestinationType } from '@packages/types';
import { axiosInstance } from './axiosConfig.ts';
import { checkUserLoggedIn } from './authCheck.ts';
import { populateForm } from '../components/destinationmodal/form.ts';

type Destination = DestinationType & { _id: string };

const populateDestinations = (destinations: Destination[], isUserSpecific: boolean) => {
  const template = document.getElementById('destination-template') as HTMLTemplateElement;
  const destinationList = isUserSpecific
    ? document.querySelector('.mydestinations-list')
    : document.querySelector('.destinations-list');

  // Clear the existing content
  if (destinationList) {
    destinationList.innerHTML = ''; // Clear existing destinations
  }

  if (destinations.length === 0 && isUserSpecific) {
    const noDestinationsMessage = document.createElement('p');
    noDestinationsMessage.textContent = 'You have no destinations yet.';
    destinationList?.appendChild(noDestinationsMessage);
    return;
  }
  destinations.forEach((destination) => {
    const clone = template.content.cloneNode(true) as HTMLElement;
    const locationElement = clone.querySelector('.destination-location span');
    const dateElement = clone.querySelector('.date span');
    const descriptionElement = clone.querySelector('.description');
    const deleteButton = clone.querySelector('.delete-button') as HTMLElement;
    const updateButton = clone.querySelector('.update-button') as HTMLButtonElement;
    const destinationIDDataset = clone.querySelector('.template-wrapper') as HTMLElement;
    const imageElement = clone.querySelector('.image') as HTMLImageElement;

    if (imageElement) {
      imageElement.src = destination.image;
    }
    // Add ids to each destination
    if (destinationIDDataset) {
      destinationIDDataset.dataset.id = destination._id;
    }

    // Populate with data
    if (locationElement) {
      locationElement.textContent = `${destination.country}, ${destination.location}`;
    }

    // Use date_start and date_end
    if (dateElement) {
      dateElement.textContent =
        destination.date_start && destination.date_end
          ? `${new Date(destination.date_start).toLocaleDateString()} - ${new Date(destination.date_end).toLocaleDateString()}`
          : 'Date information unavailable';
    }

    if (descriptionElement) {
      descriptionElement.textContent = destination.description;
    }

    // Handle delete button for user-specific destinations
    if (isUserSpecific && deleteButton) {
      deleteButton.addEventListener('click', () => {
        const confirmed = confirm('Are you sure you want to delete this destination?');
        if (confirmed) {
          deleteDestination(destination._id);
        }
      });
    } else if (deleteButton) {
      deleteButton.style.display = 'none'; // Hide delete button for non-user destinations
    }

    // Handle update button for user-specific destinations
    if (isUserSpecific && updateButton) {
      updateButton.setAttribute('data-destination-id', destination._id);
      updateButton.addEventListener('click', async () => {
        const destinationId = updateButton.getAttribute('data-destination-id');
        if (destinationId) {
          const modal = document.getElementById('destinationModal') as HTMLElement;
          const modalTitle = document.getElementById('modalTitle') as HTMLElement;
          const submitButton = document.querySelector(
            '#destinationForm button[type="submit"]',
          ) as HTMLButtonElement;

          if (modal) {
            modalTitle.textContent = 'UPDATE DESTINATION';
            submitButton.textContent = 'UPDATE DESTINATION';
            modal.classList.remove('hidden');
            modal.classList.add('flex');
          }

          // Populate the form with the destination data
          await populateForm(destinationId);
        }
      });
    } else if (updateButton) {
      updateButton.style.display = 'none'; // Hide update button for non-user destinations
    }

    // Append to the destination list
    if (destinationList) {
      destinationList.appendChild(clone);
    }
  });
};

// Fetch and populate destinations
const fetchAndPopulateDestinations = async (url: string, isUserSpecific: boolean = false) => {
  try {
    const response = await axiosInstance.get(url);
    console.log(
      isUserSpecific ? 'Fetched User Destinations:' : 'Fetched All Destinations:',
      response.data,
    );
    populateDestinations(response.data, isUserSpecific);
  } catch (error) {
    console.error(
      isUserSpecific ? 'Error fetching user destinations:' : 'Error fetching destinations:',
      error,
    );
  }
};

// Function to delete a destination
const deleteDestination = async (destinationId: string) => {
  try {
    await axiosInstance.delete(`/destination/${destinationId}`);
    const destinationElement = document.querySelector(`[data-id="${destinationId}"]`);
    if (destinationElement) {
      destinationElement.closest('.flex')?.remove();
    }
    console.log('Destination deleted:', destinationId);

    // Refresh both destination lists
    await refreshDestinations();
  } catch (error) {
    console.error('Error deleting destination:', error);
  }
};

// Function to refresh both user-specific and all destinations
export const refreshDestinations = async () => {
  await fetchAndPopulateDestinations('/destination'); // Fetch all destinations

  const loggedIn = checkUserLoggedIn();
  if (loggedIn) {
    await fetchAndPopulateDestinations('/destination/user', true); // Fetch user-specific destinations
  }
};
