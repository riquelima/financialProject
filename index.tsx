import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './hooks/useAppContext';
import ErrorBoundary from './ErrorBoundary'; // Importar o ErrorBoundary

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary> {/* Envolver com ErrorBoundary */}
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
