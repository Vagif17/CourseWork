import './AuthPage.css'
import '../../styles/Global.css'
import RegisterForm from "./RegisterForm"
import LoginForm from "./LoginForm"
import RecoveryForm from "./RecoveryForm"
import { useState } from "react"

function AuthPage() {

    const [formType, setFormType] = useState<"login" | "register" | "recovery">("login")

    return (
        <div className="grid-layout fade-in">

            <header>
                <img className="logo" src="https://res.cloudinary.com/diq4utz5c/image/upload/v1773412191/TextMeLogo-removebg-preview_i8y2ka.png"/>
                <h1>
                    <span className="text-part">Text</span>
                    <span className="me-part">Me</span>
                    <span className="dot-part">˙</span>
                </h1>
            </header>

            <main>
                <h2 className="main-text">
                    Chat, read, share,<br/>
                    Text to everyone <br/>
                    Together with us.
                </h2>

                <img src="https://res.cloudinary.com/diq4utz5c/image/upload/v1773420572/photo_2026-03-13_20-49-17_gvxodj.jpg"/>
            </main>

            <aside className="fade-in">
                {formType === "login" && <LoginForm goRegister={() => setFormType("register")} goRecovery={() => setFormType("recovery")} />}
                {formType === "register" && <RegisterForm goLogin={() => setFormType("login")} />}
                {formType === "recovery" && <RecoveryForm onClose={() => setFormType("login")} goLogin={() => setFormType("login")} goRegister={() => setFormType("register")} />}
            </aside>

            <footer>© 2026 TextMe. All rights reserved.</footer>

        </div>
    )
}

export default AuthPage