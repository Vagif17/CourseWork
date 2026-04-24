import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import "./LoginForm.css";
import "../../../../app/styles/Global.css";
import { authService } from "../../../../shared/api/services/authService.ts";
import type { LoginRequest } from "../../../../shared/api/types/auth.ts";
import { toast } from "react-toastify";
import Spinner from "../../../../shared/ui/components/Spinner";
import { getErrorMessage } from "../../../../shared/lib/utils/getErrorMessage";

type LoginFormProps = {
    goRegister: () => void;
    goRecovery: () => void;
};

function LoginForm({ goRegister, goRecovery }: LoginFormProps) {

    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginRequest>();

    const onSubmit = async (data: LoginRequest) => {
        try {
            await authService.login(data);

            toast.success("Logged in successfully!", { position: "top-center" });
            navigate("/homepage");
        } catch (err: any) {
            toast.error(getErrorMessage(err), { position: "top-center" });
        }
    };

    const onError = (errors: any) => {
        const firstErrorKey = Object.keys(errors)[0] as keyof LoginRequest;
        const message = errors[firstErrorKey]?.message || "Field is invalid";
        toast.error(message, { position: "top-center" });
    };

    return (
        <form className="login-form" onSubmit={handleSubmit(onSubmit, onError)}>
            <h2 className="form-title">LOGIN</h2>

            <input
                type="email"
                placeholder="Email"
                className={errors.email ? "input-error" : ""}
                {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format" }
                })}
            />

            <input
                type="password"
                placeholder="Password"
                className={errors.password ? "input-error" : ""}
                {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
            />

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner /> : "Login"}
            </button>

            <div className="login-links">
                <a className="register" onClick={goRegister}>Register</a>
                <a onClick={goRecovery}>Forgot password?</a>
            </div>
        </form>
    );
}

export default LoginForm;