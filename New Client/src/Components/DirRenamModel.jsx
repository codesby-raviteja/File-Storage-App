import { useEffect, useRef } from "react"

function DirRenamModel({
  reName,
  setRename,
  updateDirRename,
  setIsDirRenameEnabled,
}) {
  const inputRef = useRef()

  useEffect(() => {
    inputRef.current.focus()
    inputRef.current.select()
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 opacity-80 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Rename Directory
        </h2>
        <input
          ref={inputRef}
          type="text"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={reName.filename}
          onChange={(e) =>
            setRename((prev) => ({ ...prev, filename: e.target.value }))
          }
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => {
              setIsDirRenameEnabled(false)
            }}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={updateDirRename}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  )
}

export default DirRenamModel
