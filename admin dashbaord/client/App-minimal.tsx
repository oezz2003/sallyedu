import "./global.css";
import React from 'react';
import { createRoot } from "react-dom/client";

// Very minimal app to test if React is working
const MinimalApp = () => {
  console.log('MinimalApp rendering');
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightgreen', minHeight: '100vh' }}>
      <h1>Minimal App Test</h1>
      <p>If you see this, the basic React setup is working!</p>
    </div>
  );
};

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error('Root element not found!');
  } else {
    console.log('Root element found, creating React app...');
    createRoot(rootElement).render(<MinimalApp />);
    console.log('React app rendered successfully');
  }
} catch (error) {
  console.error('Error creating React app:', error);
}