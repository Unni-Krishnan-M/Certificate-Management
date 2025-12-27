import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './utils/axiosConfig'; // Initialize axios interceptors

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);