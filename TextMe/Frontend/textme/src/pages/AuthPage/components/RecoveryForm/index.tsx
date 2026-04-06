import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { recoveryService } from "../../../../services/recoveryService";
import './RecoveryForm.css';

type RecoveryFormProps = {
    onClose: () => void;
    goLogin: () => void;
    goRegister: () => void;
};

type Step1Data = { email: string };
type Step2Data = { code: string };
type Step3Data = { newPassword: string };

function RecoveryForm({ onClose, goLogin, goRegister }: RecoveryFormProps) {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [codeVerified, setCodeVerified] = useState("");

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<any>();

    const sendCode = async (data: Step1Data) => {
        try {
            await recoveryService.sendCode(data.email);
            toast.success("Verification code sent!", { position: "top-center" });
            setEmail(data.email);
            setStep(2);
        } catch (err: any) {
            toast.error(err.message || "Failed to send code", { position: "top-center" });
        }
    };

    const verifyCode = async (data: Step2Data) => {
        try {
            await recoveryService.verifyCode(email, data.code);
            toast.success("Code verified!", { position: "top-center" });
            setCodeVerified(data.code);
            setStep(3);
        } catch (err: any) {
            toast.error(err.message || "Invalid code", { position: "top-center" });
        }
    };

    const resetPassword = async (data: Step3Data) => {
        try {
            await recoveryService.changePassword(email, codeVerified, data.newPassword);
            toast.success("Password changed successfully!", { position: "top-center" });
            reset();
            onClose();
        } catch (err: any) {
            toast.error(err.message || "Failed to reset password", { position: "top-center" });
        }
    };

    return (
        <div className="recovery-container">
            <h2 className="form-title">Recover Account</h2>

            {step === 1 && (
                <form onSubmit={handleSubmit(sendCode)}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className={errors.email ? "input-error" : ""}
                        {...register("email", { required: "Email is required" })}
                    />
                    <p className="spam-note">
                        ⚠️ Note: The verification code may sometimes go to your Spam or Promotions folder.
                    </p>
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send Code"}
                    </button>
                    <div className="nav-links">
                        <a onClick={goLogin} className="link-button">Login</a>|
                        <a onClick={goRegister} className="link-button">Register</a>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleSubmit(verifyCode)}>
                    <input
                        type="text"
                        placeholder="Enter verification code"
                        className={errors.code ? "input-error" : ""}
                        {...register("code", { required: "Code is required" })}
                    />
                    <div className="step-buttons">
                        <button type="button" className="back-btn" onClick={() => setStep(1)}>Back</button>
                        <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Verifying..." : "Verify Code"}</button>
                    </div>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleSubmit(resetPassword)}>
                    <input
                        type="password"
                        placeholder="Enter new password"
                        className={errors.newPassword ? "input-error" : ""}
                        {...register("newPassword", { required: "New password is required", minLength: 6 })}
                    />
                    <div className="step-buttons">
                        <button type="button" className="back-btn" onClick={() => setStep(2)}>Back</button>
                        <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Resetting..." : "Reset Password"}</button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default RecoveryForm;