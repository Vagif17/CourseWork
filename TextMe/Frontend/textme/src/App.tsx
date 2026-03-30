import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import { ToastContainer } from "react-toastify";
import { Routes, Route, Navigate } from "react-router";
import { Provider } from "react-redux";
import { store } from "./store";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
      <Provider store={store}>
        <Routes>

          <Route path="/" element={<Navigate to="/homepage" />} />

          <Route path="/auth" element={<AuthPage />} />

          <Route
              path="/homepage"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
          />

          <Route path="*" element={<Navigate to="/auth" />} />

        </Routes>

          <ToastContainer
              position="top-center"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              pauseOnHover
              draggable
              theme="dark"
          />
      </Provider>
  );
}

export default App;