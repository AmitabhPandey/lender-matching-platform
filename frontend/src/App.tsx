import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from './pages/HomePage';
import { LendersPage } from './pages/LendersPage';
import { LenderCreatePage } from './pages/LenderCreatePage';
import { LenderEditPage } from './pages/LenderEditPage';
import { LenderDetailPage } from './pages/LenderDetailPage';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lenders" element={<LendersPage />} />
          <Route path="/lenders/new" element={<LenderCreatePage />} />
          <Route path="/lenders/:id/edit" element={<LenderEditPage />} />
          <Route path="/lenders/:id" element={<LenderDetailPage />} />
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
