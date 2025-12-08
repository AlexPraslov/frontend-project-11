import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import initApp from './app/app';

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  try {
    initApp();
    console.log('App initialized');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
});
