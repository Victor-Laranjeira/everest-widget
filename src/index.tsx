import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Widget from './widget/widget';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Widget />
  </React.StrictMode>
);
