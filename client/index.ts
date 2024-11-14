import { attachDatePickerListeners, destinationModal } from './components/destinationmodal/index';
import popup from './components/popup';
import { axiosLoginInstance } from '../client/utils/axiosConfig.ts';
import { checkUserLoggedIn } from './utils/authCheck.ts';
import { refreshDestinations } from './utils/populate.ts';

// Get elements from the DOM
const menuButton = document.getElementById('burger-menu') as HTMLElement;
const closeMenuButton = document.getElementById('closeMenuButton') as HTMLElement;
const navMenu = document.getElementById('navMenu') as HTMLElement;
const authButton = document.getElementById('openModal') as HTMLElement;
const logoutButton = document.getElementById('logoutButton') as HTMLElement;
const userDestinations = document.getElementById('my-destinations') as HTMLElement;

// Mobile menu
// Function to open the mobile menu
const openMenu = () => navMenu.classList.remove('translate-x-full');

// Function to close the mobile menu
const closeMenu = () => navMenu.classList.add('translate-x-full');

// Event listeners
menuButton.addEventListener('click', openMenu);
closeMenuButton.addEventListener('click', closeMenu);

// Function to update UI based on login status
const updateAuthButtons = () => {
  const loggedIn = checkUserLoggedIn();

  if (loggedIn) {
    userDestinations.style.display = 'flex';
    authButton.classList.add('hidden');
    authButton.style.display = 'none'; // Hide auth button
    logoutButton.classList.remove('hidden');
    logoutButton.style.display = 'flex'; // Show logout button
  } else {
    userDestinations.style.display = 'none';
    authButton.classList.remove('hidden');
    authButton.style.display = 'flex'; // Show auth button
    logoutButton.classList.add('hidden');
    logoutButton.style.display = 'none'; // Hide logout button
  }
};

logoutButton.addEventListener('click', async () => {
  const confirmed = confirm('Are you sure you want to log out?');

  if (!confirmed) {
    return; // If the user clicks "Cancel", exit the function without logging out
  }

  try {
    const result = await axiosLoginInstance.get('/logout');

    if (result.data.isLoggedIn === false) {
      // Set isLoggedIn to false in localStorage after logout
      localStorage.setItem('isLoggedIn', 'false');
      alert('Successfully logged out');
      updateAuthButtons();
      document.dispatchEvent(new CustomEvent('userLoggedOut'));
    }
  } catch (error) {
    alert('Logout failed. Please try again.');
  }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is logged in
  checkUserLoggedIn();
  // Fetch both destination lists on load
  await refreshDestinations();
  // Update buttons based on login status
  updateAuthButtons();

  destinationModal();

  popup();

  attachDatePickerListeners();
});
document.addEventListener('userLoggedIn', async () => {
  console.log('userLoggedIn event');
  const navMenu = document.getElementById('navMenu');
  if (navMenu) {
    navMenu.classList.add('translate-x-full'); // Hide the navMenu
  }
  checkUserLoggedIn();

  updateAuthButtons();

  destinationModal();

  popup();

  attachDatePickerListeners();
  await refreshDestinations();
});

document.addEventListener('userLoggedOut', () => {
  const navMenu = document.getElementById('navMenu');
  if (navMenu) {
    navMenu.classList.add('translate-x-full'); // Hide the navMenu
  }
});
