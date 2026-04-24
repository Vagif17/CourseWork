import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import type { RootState } from "../../../../app/store";
import type { ReactElement } from "react";

type ProtectedRouteProps = {
    children: ReactElement;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

    if (!isLoggedIn) {
        return <Navigate to="/auth" replace />;
    }

    return children;
};