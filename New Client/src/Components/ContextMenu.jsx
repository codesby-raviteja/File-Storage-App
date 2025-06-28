import React from "react"
import { FaDownload, FaEdit, FaTrash } from "react-icons/fa"

const ContextMenu = ({
  contextCoord,
  openContextMenu,
  setIsRenameEnabled,
  setIsDirRenameEnabled,
  handleDeletion,
}) => {
  return openContextMenu.isDirectory ? (
    <>
      <ul
        className="absolute bg-white border border-gray-200 rounded-lg shadow-lg w-36 z-50"
        style={{ top: contextCoord.y, left: contextCoord.x }}
      >
        <li
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
          onClick={() => setIsDirRenameEnabled(true)}
        >
          <FaEdit className="text-yellow-500" />
          Rename
        </li>
        <li
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
          onClick={handleDeletion}
        >
          <FaTrash className="text-red-500" />
          Delete
        </li>
      </ul>
    </>
  ) : (
    <>
      <ul
        className="absolute bg-white border border-gray-200 rounded-lg shadow-lg w-36 z-50"
        style={{ top: contextCoord.y, left: contextCoord.x }}
      >
        <li
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
          onClick={() => onOptionClick("download")}
        >
          <FaDownload className="text-blue-500" />
          Download
        </li>
        <li
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
          onClick={() => setIsRenameEnabled(true)}
        >
          <FaEdit className="text-yellow-500" />
          Rename
        </li>
        <li
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-700 cursor-pointer"
          onClick={handleDeletion}
        >
          <FaTrash className="text-red-500" />
          Delete
        </li>
      </ul>
    </>
  )
}

export default ContextMenu
