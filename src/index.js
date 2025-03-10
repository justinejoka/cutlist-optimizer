import React from 'react';
import ReactDOM from 'react-dom/client';
import CartOptimizer from './components/CartOptimizer';
import './index.css'; // Ensure TailwindCSS directives are included

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CartOptimizer />
  </React.StrictMode>
);
