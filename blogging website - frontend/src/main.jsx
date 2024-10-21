import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast'
import './index.css'
import {BrowserRouter } from 'react-router-dom'


ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode> 
    <BrowserRouter>
      <div><Toaster/></div>
        <App />
     
    </BrowserRouter> 
    

  /* </React.StrictMode>, */
)