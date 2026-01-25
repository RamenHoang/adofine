import React from 'react';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import AdminApp from './AdminApp';

function App() {
  return (
    <AuthProvider>
      <AdminApp />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AuthProvider>
  );
}

export default App;
