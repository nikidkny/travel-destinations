import HTML from './index.html?raw';

export const initializePopup = () => {
  const popupTemplate = document.createElement('template');
  popupTemplate.innerHTML = HTML.trim();

  const body = document.body;
  if (body) {
    body.appendChild(popupTemplate.content);
  }

  const closePopupBtn = document.getElementById('closePopupBtn') as HTMLButtonElement;
  closePopupBtn?.addEventListener('click', hidePopup);
};

export const showPopup = (title: string, message: string, type: 'success' | 'error') => {
  const popup = document.getElementById('customPopup') as HTMLElement;
  const popupTitle = document.getElementById('popupTitle') as HTMLElement;
  const popupMessage = document.getElementById('popupMessage') as HTMLElement;
  const popupContainer = document.getElementById('popupContainer') as HTMLElement;

  if (popup && popupTitle && popupMessage && popupContainer) {
    popupTitle.textContent = title;
    popupMessage.textContent = message;

    if (type === 'success') {
      popupContainer.classList.remove('bg-red-100', 'text-red-700');
      popupContainer.classList.add('bg-green-100', 'text-green-700');
    } else if (type === 'error') {
      popupContainer.classList.remove('bg-green-100', 'text-green-700');
      popupContainer.classList.add('bg-red-100', 'text-red-700');
    }

    popup.classList.remove('hidden');
  }
};

export const hidePopup = () => {
  const popup = document.getElementById('customPopup') as HTMLElement;
  if (popup) {
    popup.classList.add('hidden');
  }
};
