/**
 * Example: 2D infinite image carousel (also used on Home → News with API data):
 *
 * import ImageCarousel from "./components/ImageCarousel";
 * const images = ["/images/img1.jpg", ...];
 * <ImageCarousel
 *   items={images.map((src, i) => ({ id: String(i), imageUrl: src, label: `Slide ${i + 1}` }))}
 *   cycleMs={26000}
 * />
 */
import AuthPage from "../pages/AuthPage";
import HomePage from "../pages/HomePage";
import { Routes, Route, Navigate } from "react-router";
import { Provider } from "react-redux";
import { store } from "./store";
import { ProtectedRoute } from "../shared/ui/components/ProtectedRoute";
import ToastProvider from "../shared/ui/components/ToastProvider";

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