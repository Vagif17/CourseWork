import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route, Link, NavLink } from "react-router";
import CreateForm from "./components/Createform/index.jsx";
import Incomes from "./components/Incomes/index.jsx";
import Expenses from "./components/Expenses/index.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>


        <nav  style={{
            display: "flex",
            gap: "30px",
            justifyContent: "center",
            marginTop: "20px"
        }}>
            <NavLink to="/"
                     style={({ isActive }) => ({ color: isActive ? "blue" : "black" })}
            >
                Home</NavLink>

            <NavLink
                to="/expenses"
                style={({ isActive }) => ({ color: isActive ? "blue" : "black" })}
            >
                Expenses</NavLink>

            <NavLink to="/incomes"
                     style={({ isActive }) => ({ color: isActive ? "blue" : "black" })}
            >
                Incomes</NavLink>
        </nav>

        <Routes>
            <Route path="/" element={<CreateForm />} />
            <Route path="/incomes" element={<Incomes/>} />
            <Route path="/expenses" element={<Expenses />} />
        </Routes>
    </>
  )
}

export default App
