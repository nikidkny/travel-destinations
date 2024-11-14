import { uploadImage, deleteImage } from './storage';
import { checkAuth } from './utils/authCheck.ts';

await checkAuth();

const filepicker = document.getElementById('file') as HTMLInputElement;
const submit = document.getElementById('submit') as HTMLButtonElement;
const missingFiles = document.getElementById('missing-files') as HTMLParagraphElement;
const image = document.getElementById('image') as HTMLImageElement;

filepicker.addEventListener('click', () => {
  if (!missingFiles.classList.contains('hidden')) {
    missingFiles.classList.add('hidden');
  }
});

submit.addEventListener('click', async () => {
  if (!missingFiles.classList.contains('hidden')) {
    missingFiles.classList.add('hidden');
  }
  if (filepicker.files != null && filepicker.files.length > 0) {
    const upload = await uploadImage(filepicker.files[0]);
    if (upload.success) {
      image.src = upload.url;
      image.classList.remove('hidden');
      window.open(upload.url, '_blank');
    }
  } else {
    missingFiles.classList.remove('hidden');
  }
});

image.addEventListener('click', async () => {
  const confirmation = confirm('Do you want to delete the image?');
  if (confirmation) {
    const split = image.getAttribute('src')?.split('/')!;
    const del = await deleteImage(split[split.length - 1]);
    if (del.success) {
      image.classList.add('hidden');
    } else {
      alert(del);
    }
  }
});
