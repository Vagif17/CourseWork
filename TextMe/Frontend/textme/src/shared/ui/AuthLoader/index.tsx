import "./AuthLoader.css";
import Spinner from "../components/Spinner";


export default function AuthLoader() {
    return (
        <div className="auth-loader">
            <Spinner />
            <p>Initializing session...</p>
        </div>
    );
}