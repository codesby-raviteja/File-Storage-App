import { FaFolderPlus, FaUpload } from "react-icons/fa"

const DriveHeader = ({
  setCreateDirModel,
  filesInput,
  handleUpload,
  dirName,
}) => {
  return (
    <div className="flex justify-between items-center px-2 py-4 border-b">
      <h1 className="text-2xl font-semibold text-gray-800">
        {dirName || "My Drive"}
      </h1>
      <div className="flex space-x-6">
        <button
          title="Create Folder"
          className="text-blue-600 hover:text-blue-800 text-2xl cursor-pointer"
          onClick={() => {
            setCreateDirModel(true)
          }}
        >
          <FaFolderPlus />
        </button>
        <button
          title="Upload File"
          className="text-blue-600 hover:text-blue-800 text-2xl cursor-pointer"
          onClick={() => filesInput.current.click()}
        >
          <FaUpload />
        </button>
        <input
          type="file"
          multiple
          className="hidden"
          ref={filesInput}
          onChange={handleUpload}
        />
      </div>
    </div>
  )
}

export default DriveHeader
