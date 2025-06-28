import { createBrowserRouter, RouterProvider } from "react-router-dom"
import DirectoryView from "./DirectoryView"
import Signup from "./Components/Signup"
import Login from "./Components/Login"
import UserContextProvider from "./Context/userContext"

const Router = createBrowserRouter([
  {
    path: "/",
    element: <DirectoryView />,
  },

  {
    path: "/:id",
    element: <DirectoryView />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
])

function App() {
  return (
    <UserContextProvider>
      <RouterProvider router={Router} />
    </UserContextProvider>
  )
}

export default App
