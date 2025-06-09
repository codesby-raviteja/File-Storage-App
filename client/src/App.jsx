import { createBrowserRouter, RouterProvider } from "react-router-dom"
import DirectoryView from "./DirectoryView"

const Router = createBrowserRouter([
  {
    path: "/*",
    element: <DirectoryView />,
  },
])

function App() {
  return <RouterProvider router={Router} />
}

export default App
