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
    try {
      const response = await fetch(URL + "/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(formData),
        credentials: "include",
      })

      const { status, data, error } = await response.json()
      if (status !== 200) {
        throw new Error(error)
      }
      navigate("/")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 shadow-lg rounded-xl p-8 w-full max-w-sm space-y-5"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Login
        </h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Login
        </button>
        <p className="text-md text-gray-600 text-center">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  )
}
export default LoginComponent
