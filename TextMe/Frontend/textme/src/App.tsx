import AuthPage from "./components/AuthPage";
import {ToastContainer} from "react-toastify";

function App() {

  return (
    <>
      <AuthPage />
        <ToastContainer
            position="bottom-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />

    </>
  )
}

export default App
