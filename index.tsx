
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Critical Runtime Error during React initialization:", err);
    container.innerHTML = `
      <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #020617; color: #94a3b8; font-family: sans-serif; text-align: center; padding: 20px;">
        <h1 style="color: #f97316; margin-bottom: 10px;">Initialization Failed</h1>
        <p>The application encountered a critical error during startup.</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #0ea5e9; color: white; border: none; border-radius: 8px; cursor: pointer;">Retry Connection</button>
      </div>
    `;
  }
} else {
  console.error("Critical Failure: Root element not found. Check index.html structure.");
}
