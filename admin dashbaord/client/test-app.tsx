import React from 'react';
import { createRoot } from 'react-dom/client';

// Simple test component to check if React is working
const TestApp = () => {
  console.log('TestApp is rendering');
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue' }}>
      <h1>React Test App</h1>
      <p>If you can see this, React is working!</p>
    </div>
  );
};

const root = document.getElementById('root');
if (root) {
  console.log('Root element found');
  createRoot(root).render(<TestApp />);
} else {
  console.error('Root element not found!');
}