import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LanguageProvider } from './context/LanguageContext';
import { applyThemeToDocument } from './theme';
import App from './App';
import './styles/global.css';

applyThemeToDocument();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
