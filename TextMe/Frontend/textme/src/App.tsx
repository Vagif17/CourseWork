import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import {ToastContainer} from "react-toastify";
import {Routes,Route,Navigate} from "react-router";
import {useEffect, useState} from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(Boolean(localStorage.getItem('token')));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(Boolean(localStorage.getItem('token')));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <>
      <Routes>

        <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/homepage" /> : <Navigate to="/auth" />}
        />

        <Route path="/auth" element={<AuthPage />} />

        <Route
            path="/homepage"
            element={isLoggedIn ? <HomePage /> : <Navigate to="/auth" />}
        />

        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>


      <ToastContainer
          position="bottom-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
      />

    </>
  )
}

export default App

