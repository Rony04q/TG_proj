// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';

// 1. ADD THIS IMPORT
import 'bootstrap/dist/css/bootstrap.min.css'; 

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);