import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import StreamsPage from './pages/StreamsPage.tsx';
import './assets/fonts/fonts.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { client } from './lib/queryClient.ts';
import { BrowserRouter, Routes, Route } from 'react-router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/streams" element={<StreamsPage />} />
          <Route path="*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
