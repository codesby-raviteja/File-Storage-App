import { useEffect, useRef } from "react"

const RenameModal = ({
  reName,
  setRename,
  setIsRenameEnabled,
  updateRename,
}) => {
  const inputRef = useRef()

  useEffect(() => {
    const [fileName, format] = reName.filename.split(".")

    inputRef.current.focus()

    inputRef.current.setSelectionRange(0, fileName.length)
  }, [])

  return (
    <div className="flex justify-center items-center">
      <div className="fixed inset-0 flex items-center justify-center bg-gray-500 opacity-80 z-0"></div>
      <div className=" bg-white rounded-lg shadow-lg p-6 w-full max-w-96 z-20">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Rename File
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
              setIsRenameEnabled(false)
            }}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={updateRename}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default RenameModal
