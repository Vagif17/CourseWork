import { useForm } from "react-hook-form";
import "./LoginForm.css";
import "../../styles/Global.css";
import { authService } from "../../services/authService.ts";
import type { AuthResponse } from "../../types/auth.ts";
import {toast} from "react-toastify";

type LoginFormProps = {
    goRegister: () => void;
};

type LoginFormData = {
    email: string;
    password: string;
};

function LoginForm({ goRegister }: LoginFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData) => {
        try {
            const response: AuthResponse = await authService.login(
                data.email,
                data.password
            );

            console.log("Logged in:", response);
            toast.success("Logged in successfully!", { position: "top-center" });
        } catch (err: any) {
            toast.error("Incorrect email or password", { position: "top-center" });
            console.log(err.response?.data?.message || err);
        }
    };

    const onError = (errors: any) => {
        const firstErrorKey = Object.keys(errors)[0] as keyof LoginFormData
        const message = errors[firstErrorKey]?.message || "Field is invalid"
        toast.error(message, { position: "top-center" })
    }

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
                {isSubmitting ? "Logging in..." : "Login"}
            </button>

            <div className="login-links">
                <a className="register" onClick={goRegister}>
                    Register
                </a>
                <a>Forgot password?</a>
            </div>
        </form>
    );
}

export default LoginForm;