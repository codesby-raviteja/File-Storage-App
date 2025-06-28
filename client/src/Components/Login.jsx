import React, { useContext, useState } from "react"
import { userContext } from "../Context/userContext"
import { Link, useNavigate } from "react-router-dom"

const URL = "http://localhost:5000"

const LoginComponent = () => {
  const [formData, setFormData] = useState({
    email: "ravi@admin.com",
    password: "Raviteja",
  })

  const navigate = useNavigate()
  const [user, setUser] = useContext(userContext)

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("Logging in with:", formData)
    const response = await fetch(URL + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()
    if (data?.userData) {
      setUser(data?.userData)
      return navigate(`/${data?.rootDir?.id}`)
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <p>
          Don't have an account <Link to={"/signup"}>signup</Link>{" "}
        </p>
        <h2>Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  )
}

// Simple inline styles
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  form: {
    padding: "2rem",
    borderRadius: "10px",
    backgroundColor: "rgba(190, 190, 190, 0.1)",
    boxShadow: "0 0 10px rgba(235, 229, 229, 0.1)",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "0.7rem",
    backgroundColor: "#007bff",
    color: "#fff",
    fontSize: "1rem",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
}

export default LoginComponent
