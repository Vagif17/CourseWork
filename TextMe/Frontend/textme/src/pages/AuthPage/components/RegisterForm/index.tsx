import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { authService } from "../../../../services/authService.ts"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "./RegisterForm.css"
import "../../../../styles/Global.css"
import type { RegisterRequest } from "../../../../types/auth"

type RegisterFormProps = {
    goLogin: () => void
}

type RegisterFormData = {
    userName: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    password: string
    confirmPassword: string
}

function RegisterForm({ goLogin }: RegisterFormProps) {

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        watch
    } = useForm<RegisterFormData>()

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.files && e.target.files.length > 0) {

            const file = e.target.files[0]

            setAvatarFile(file)

            setAvatarPreview(URL.createObjectURL(file))
        }
    }

    const onSubmit = async (data: RegisterFormData) => {
        try {
            const request: RegisterRequest = { ...data, avatar: avatarFile ?? undefined };
            await authService.register(request);

            toast.success("Registration successful!", { position: "top-center" });
            goLogin();
        } catch {
            toast.error("Registration failed. Please try again.", { position: "top-center" });
        }
    };

    const onError = (errors: any) => {

        const firstErrorKey = Object.keys(errors)[0] as keyof RegisterFormData

        const message = errors[firstErrorKey]?.message || "Field is invalid"

        toast.error(message, { position: "top-center" })
    }

    return (
        <form className="register-form" onSubmit={handleSubmit(onSubmit, onError)}>

            <h2 className="form-title">REGISTER</h2>

            <div className="avatar-upload-container">

                <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                />

                <label htmlFor="avatar" className="avatar-label">

                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar Preview" className="avatar-preview" />
                    ) : (
                        <span className="avatar-plus">+</span>
                    )}

                </label>

            </div>

            <div className="form-grid">

                <input
                    placeholder="Username"
                    className={errors.userName ? "input-error-username" : "full-width"}
                    {...register("userName", { required: "Username is required" })}
                />

                <input
                    placeholder="First name"
                    className={errors.firstName ? "input-error" : ""}
                    {...register("firstName", { required: "First name is required" })}
                />

                <input
                    placeholder="Last Name"
                    className={errors.lastName ? "input-error" : ""}
                    {...register("lastName", { required: "Last name is required" })}
                />

                <input
                    placeholder="Email"
                    type="email"
                    className={errors.email ? "input-error" : ""}
                    {...register("email", {
                        required: "Email is required",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Invalid email format"
                        }
                    })}
                />

                <Controller
                    control={control}
                    name="phoneNumber"
                    defaultValue="+"
                    rules={{
                        required: "Phone number is required",
                        pattern: {
                            value: /^\+\d+$/,
                            message: "Phone number must start with + and contain only digits"
                        },
                        minLength: {
                            value: 9,
                            message: "Phone number must contain at least 9 digits"
                        }
                    }}
                    render={({ field }) => (
                        <input
                            placeholder="Phone number"
                            type="tel"
                            className={errors.phoneNumber ? "input-error" : ""}
                            {...field}
                        />
                    )}
                />

                <input
                    placeholder="Password"
                    type="password"
                    className={errors.password ? "input-error" : ""}
                    {...register("password", {
                        required: "Password is required",
                        minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters"
                        }
                    })}
                />

                <input
                    placeholder="Confirm password"
                    type="password"
                    className={errors.confirmPassword ? "input-error" : ""}
                    {...register("confirmPassword", {
                        required: "Confirm password is required",
                        validate: value =>
                            value === watch("password") || "Passwords do not match"
                    })}
                />

            </div>

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register"}
            </button>

            <div className="register-links">
                <span>Already have an account? </span>
                <a onClick={goLogin}>Login</a>
            </div>

        </form>
    )
}

export default RegisterForm