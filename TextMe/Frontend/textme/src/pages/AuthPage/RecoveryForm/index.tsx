import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { recoveryService } from "../../../services/recoveryService.ts";
import Spinner from "../../../components/Spinner";
import "./RecoveryForm.css";

type RecoveryFormProps = {
    onClose: () => void;
    goLogin: () => void;
    goRegister: () => void;
};

type Step1Data = {
    email: string;
};

type Step2Data = {
    code: string;
};

type Step3Data = {
    newPassword: string;
};

type FormErrors<T> = {
    [K in keyof T]?: { message?: string };
};

function RecoveryForm({ onClose, goLogin, goRegister }: RecoveryFormProps) {

    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState("");
    const [verifiedCode, setVerifiedCode] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<Step1Data & Step2Data & Step3Data>();

    const handleFormError = (errors: FormErrors<any>) => {
        const firstError = Object.values(errors)[0];
        toast.error(firstError?.message || "Invalid field", {
            position: "top-center"
        });
    };

    const sendCode = async ({ email }: Step1Data) => {
        try {
            await recoveryService.sendCode(email);
            toast.success("Verification code sent!", { position: "top-center" });

            setEmail(email);
            setStep(2);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to send code", {
                position: "top-center"
            });
        }
    };

    const verifyCode = async ({ code }: Step2Data) => {
        try {
            await recoveryService.verifyCode(email, code);

            toast.success("Code verified!", { position: "top-center" });

            setVerifiedCode(code);
            setStep(3);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Invalid code", {
                position: "top-center"
            });
        }
    };

    const resetPassword = async ({ newPassword }: Step3Data) => {
        try {
            await recoveryService.changePassword(email, verifiedCode, newPassword);

            toast.success("Password changed successfully!", {
                position: "top-center"
            });

            reset();
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to reset password", {
                position: "top-center"
            });
        }
    };

    return (
        <div className="recovery-container">

            <h2 className="form-title">Recover Account</h2>

            {step === 1 && (
                <form onSubmit={handleSubmit(sendCode, handleFormError)}>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        className={errors.email ? "input-error" : ""}
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Invalid email format"
                            }
                        })}
                    />

                    <p className="spam-note">
                        ⚠️ The verification code may appear in Spam or Promotions.
                    </p>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Spinner /> : "Send Code"}
                    </button>

                    <div className="nav-links">
                        <a onClick={goLogin} className="link-button">Login</a>
                        <span>|</span>
                        <a onClick={goRegister} className="link-button">Register</a>
                    </div>

                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleSubmit(verifyCode, handleFormError)}>

                    <input
                        type="text"
                        placeholder="Enter verification code"
                        className={errors.code ? "input-error" : ""}
                        {...register("code", {
                            required: "Verification code is required",
                            minLength: {
                                value: 4,
                                message: "Code is too short"
                            }
                        })}
                    />

                    <div className="step-buttons">

                        <button
                            type="button"
                            className="back-btn"
                            onClick={() => setStep(1)}
                        >
                            Back
                        </button>

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner /> : "Verify Code"}
                        </button>

                    </div>

                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleSubmit(resetPassword, handleFormError)}>

                    <input
                        type="password"
                        placeholder="Enter new password"
                        className={errors.newPassword ? "input-error" : ""}
                        {...register("newPassword", {
                            required: "Password is required",
                            minLength: {
                                value: 6,
                                message: "Password must be at least 6 characters"
                            }
                        })}
                    />

                    <div className="step-buttons">

                        <button
                            type="button"
                            className="back-btn"
                            onClick={() => setStep(2)}
                        >
                            Back
                        </button>

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Spinner /> : "Reset Password"}
                        </button>

                    </div>

                </form>
            )}

        </div>
    );
}

export default RecoveryForm;