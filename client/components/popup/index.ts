import HTML from './index.html?raw';
import { axiosLoginInstance } from '../../utils/axiosConfig.ts';
import { AxiosError } from 'axios';

const popup = () => {
  // Create a template element and parse the HTML string into the content
  const popupHtml = document.createElement('template');
  popupHtml.innerHTML = HTML.trim();

  // Append the modal to the main element in the document
  const main = document.querySelector('main');
  if (main) {
    main.appendChild(popupHtml.content);
  }

  const modal = document.getElementById('modal') as HTMLElement;
  const loginBtn = document.getElementById('loginBtn') as HTMLButtonElement;
  const modalTitle = document.getElementById('modalTitle') as HTMLElement;
  const nameField = document.getElementById('nameField') as HTMLElement;
  const closeModal = document.getElementById('closeModal') as HTMLElement;
  const toggleText = document.getElementById('toggleText') as HTMLElement;

  // Input Fields and Error Messages
  const usernameInput = document.getElementById('username') as HTMLInputElement;
  const passwordInput = document.getElementById('password') as HTMLInputElement;
  const nameInput = document.getElementById('name') as HTMLInputElement;
  const usernameError = document.getElementById('usernameError') as HTMLElement;
  const passwordError = document.getElementById('passwordError') as HTMLElement;
  const nameError = document.getElementById('nameError') as HTMLElement;

  let isLogin = true; // Track if we're in login or sign-up mode

  // Track if a field has been touched
  let usernameTouched = false;
  let passwordTouched = false;
  let nameTouched = false;

  const showModal = () => {
    modal.classList.remove('hidden');
  };

  const hideModal = () => {
    modal.classList.add('hidden');
    resetForm(); // Reset form when modal is closed
  };

  // Function to toggle between Login and Sign Up
  const toggleFormFunction = () => {
    isLogin = !isLogin;

    if (isLogin) {
      modalTitle.innerText = 'LOGIN';
      loginBtn.innerText = 'Login';
      nameField.classList.add('hidden');
      toggleText.innerHTML =
        'DON’T HAVE AN ACCOUNT? <a id="toggleForm" href="#" class="underline">SIGN UP HERE</a>';
      loginBtn.disabled = false; // Enable button in login mode
    } else {
      modalTitle.innerText = 'SIGN UP';
      loginBtn.innerText = 'Sign Up';
      nameField.classList.remove('hidden');
      toggleText.innerHTML =
        'ALREADY HAVE AN ACCOUNT? <a id="toggleForm" href="#" class="underline">LOG IN HERE</a>';
      loginBtn.disabled = true; // Disable button until validation passes
    }
    resetForm();
  };

  // Add event listener for the form toggle (Sign Up <-> Login)
  toggleText.addEventListener('click', (e) => {
    e.preventDefault();
    toggleFormFunction();
  });

  // Add event listener to show the modal
  const openModalButton = document.getElementById('openModal');
  openModalButton?.addEventListener('click', showModal);

  // Add event listener to hide the modal
  closeModal.addEventListener('click', hideModal);

  // Debounce Function with Explicit Types
  function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number,
  ): (...args: Parameters<T>) => void {
    let timeout: number | undefined;
    return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
      timeout = window.setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Validation Functions
  const validateUsername = (): boolean => {
    const username = usernameInput.value.trim();
    const usernameRegex = /^[a-zA-Z0-9._-]{4,}$/;

    if (usernameTouched && !usernameRegex.test(username)) {
      usernameError.classList.remove('hidden');
      usernameInput.classList.add('border-red-500');
      usernameInput.classList.remove('border-green-500');
      return false;
    } else {
      usernameError.classList.add('hidden');
      usernameInput.classList.remove('border-red-500');
      usernameInput.classList.add('border-green-500');
      return true;
    }
  };

  const validatePassword = (): boolean => {
    const password = passwordInput.value;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (passwordTouched && !passwordRegex.test(password)) {
      passwordError.classList.remove('hidden');
      passwordInput.classList.add('border-red-500');
      passwordInput.classList.remove('border-green-500');
      return false;
    } else {
      passwordError.classList.add('hidden');
      passwordInput.classList.remove('border-red-500');
      passwordInput.classList.add('border-green-500');
      return true;
    }
  };

  const validateName = (): boolean => {
    const name = nameInput?.value.trim();
    const nameRegex = /^[A-Z][a-zA-Z\s]{2,}$/; // Name starts with capital letter and has at least 3 chars

    if (nameTouched && !nameRegex.test(name)) {
      nameError.classList.remove('hidden');
      nameInput.classList.add('border-red-500');
      nameInput.classList.remove('border-green-500');
      return false;
    } else {
      nameError.classList.add('hidden');
      nameInput.classList.remove('border-red-500');
      nameInput.classList.add('border-green-500');
      return true;
    }
  };

  const validateForm = (): boolean => {
    if (!isLogin) {
      const isUsernameValid = validateUsername();
      const isPasswordValid = validatePassword();
      const isNameValid = validateName();

      // Enable the sign-up button only if all validations pass
      loginBtn.disabled = !(isUsernameValid && isPasswordValid && isNameValid);

      return isUsernameValid && isPasswordValid && isNameValid;
    } else {
      // In login mode, no validation is required
      loginBtn.disabled = false;
      return true;
    }
  };

  // Debounced Input Event Listeners
  usernameInput.addEventListener(
    'input',
    debounce(() => {
      if (!isLogin) {
        usernameTouched = true;
        validateUsername();
        validateForm();
      }
    }, 500),
  );

  passwordInput.addEventListener(
    'input',
    debounce(() => {
      if (!isLogin) {
        passwordTouched = true;
        validatePassword();
        validateForm();
      }
    }, 500),
  );

  nameInput?.addEventListener(
    'input',
    debounce(() => {
      if (!isLogin) {
        nameTouched = true;
        validateName();
        validateForm();
      }
    }, 500),
  );

  // Handle Enter Key Press to Trigger Login/Sign-Up
  const handleEnterKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      loginBtn.click();
    }
  };

  usernameInput.addEventListener('keydown', handleEnterKey);
  passwordInput.addEventListener('keydown', handleEnterKey);
  nameInput?.addEventListener('keydown', handleEnterKey);

  // Handle login or sign-up button click
  loginBtn.addEventListener('click', async () => {
    if (!isLogin && !validateForm()) {
      alert('Please fix the errors in the form before submitting.');
      return;
    }

    const credentials: { username: string; password: string; name?: string } = {
      username: usernameInput.value.trim(),
      password: passwordInput.value,
    };

    if (!isLogin) {
      credentials.name = nameInput.value.trim();
    }

    try {
      const endpoint = isLogin ? '/login' : '/signup';
      const result = await axiosLoginInstance.post(endpoint, credentials);

      alert(result.data.message); // Show success message
      if (isLogin) {
        localStorage.setItem('isLoggedIn', 'true');
        hideModal();
        document.dispatchEvent(new CustomEvent('userLoggedIn'));
      } else {
        toggleFormFunction();
      }
      resetForm();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data.message) {
        alert(error.response.data.message);
      } else {
        alert('Operation failed. Please try again.');
      }
    }
  });

  // Reset Form Function
  const resetForm = () => {
    usernameInput.value = '';
    passwordInput.value = '';
    nameInput.value = '';

    // Reset validation styles and hide error messages
    usernameError.classList.add('hidden');
    passwordError.classList.add('hidden');
    nameError.classList.add('hidden');
    usernameInput.classList.remove('border-red-500', 'border-green-500');
    passwordInput.classList.remove('border-red-500', 'border-green-500');
    nameInput.classList.remove('border-red-500', 'border-green-500');

    loginBtn.disabled = !isLogin; // Enable or disable based on mode

    // Reset touched state
    usernameTouched = false;
    passwordTouched = false;
    nameTouched = false;
  };
};

export default popup;
