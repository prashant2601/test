import { createRoot } from 'react-dom/client';
import './index.css';
import AppWithProviders from './providers/AppWithProviders.js';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(<AppWithProviders />);
} else {
  console.error("Root element with id 'root' not found.");
}
