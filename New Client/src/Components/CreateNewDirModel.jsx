import { useEffect, useRef } from "react"

function CreateNewDirModel({
  newDirectoryName,
  setNewDirectoryName,
  setCreateDirModel,
  handleCreateDirectory,
}) {
  const inputRef = useRef()

  useEffect(() => {
    inputRef.current.focus()
    inputRef.current.select()
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 opacity-80 z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-96">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Create a new Directory
        </h2>

        <input
          type="text"
          ref={inputRef}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          value={newDirectoryName}
          onChange={(e) => setNewDirectoryName(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handleCreateDirectory}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create
          </button>
          <button
            onClick={() => {
              setCreateDirModel(false)
            }}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateNewDirModel
