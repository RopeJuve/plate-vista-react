
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { CartProvider } from './CartContext';  // Import CartProvider

import { ContextProvider } from './contexts/ContextProvider';  

import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NCaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXdfc3RdQ2dcUUB1V0Q=');

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <ContextProvider>
      <CartProvider>
      <App />
      </CartProvider>
    </ContextProvider>
  </StrictMode>

);
