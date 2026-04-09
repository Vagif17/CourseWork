import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import { Routes, Route, Navigate } from "react-router";
import { Provider } from "react-redux";
import { store } from "./store";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ToastProvider from "./components/ToastProvider";

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

            <ToastProvider />
        </Provider>
    );
}

export default App;