import './style.css';

const form = document.getElementById('rss-form');
const input = document.getElementById('rss-url');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const url = input.value;
  console.log('RSS URL:', url);
  input.value = '';
});
