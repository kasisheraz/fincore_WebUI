import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import finCoreTheme from './theme/finCoreTheme';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={finCoreTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);