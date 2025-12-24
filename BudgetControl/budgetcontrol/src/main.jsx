import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux'
import App from './App.jsx'
import {store} from "./store/index.js";
import {BrowserRouter} from "react-router";
import CreateForm from "./components/Createform/index.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <Provider store={store}>
          <BrowserRouter>
              <App />
          </BrowserRouter>
      </Provider>
  </StrictMode>,
)
