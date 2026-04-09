import "./AuthLoader.css";
import Spinner from "../../../components/Spinner";

//Когда jwt обновляется чтобы просто экран не зависал я решил добавить вот такой компонент загрузки

export default function AuthLoader() {
    return (
        <div className="auth-loader">
            <Spinner />
            <p>Initializing session...</p>
        </div>
    );
}