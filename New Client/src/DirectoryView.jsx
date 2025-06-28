import { Fragment, useContext, useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { userContext } from "./Context/userContext"
import DriveHeader from "./Components/Header"
import Drive from "./Components/Drive"
import FileRenameModal from "./Components/FileRenameModel"
import DirRenamModel from "./Components/DirRenamModel"
import CreateNewDirModel from "./Components/CreateNewDirModel"
import UploadDialogueBox from "./Components/UploadingDialogBox.jsx"

const URL = "http://localhost:5000" //Enter your  localhost

// const URL = "http://localhost/"

function DirectoryView() {
  const params = useParams()

  const directoryId = params["id"]

  const [directoryData, setDirectoryData] = useState()

  //RENAME THE FILE / DIRECTORY
  const [reName, setRename] = useState({ id: null, filename: "" })
  const [isRenameEnabled, setIsRenameEnabled] = useState(false)
  const [isDirRenameEnabled, setIsDirRenameEnabled] = useState(false)

  //Creating Dir
  const [newDirectoryName, setNewDirectoryName] = useState("New Folder")
  const [createDirModel, setCreateDirModel] = useState(false)

  //Handling Upload
  const [filesToBeUploaded, setFilesToBeUploaded] = useState([])
  const [openUploadModel, setIsOpenUploadModel] = useState(false)

  //Handling Deletion
  const [deleteDetails, setDeleteDetails] = useState({ type: "", id: "" })

  const [user, setUser] = useContext(userContext)
  const navigate = useNavigate()

  useEffect(() => {
    getFiles()
  }, [directoryId])

  //UPLOADING FILE
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)

    const filesToUpload = files.map((file) => ({
      id: `${file.name}-${new Date()}`,
      name: file.name,
      file,
      isUploaded: false,
      progress: 0,
    }))
    setFilesToBeUploaded(filesToUpload)
    setIsOpenUploadModel(true)
    UploadFiles(filesToUpload)
  }

  const UploadFiles = (Que) => {
    if (Que.length === 0) {
      return console.log("Files OVER")
    }

    const [currentFile, ...leftOver] = Que

    const uploadURL = URL + `/file/upload/${directoryId}`
    const xhr = new XMLHttpRequest()
    xhr.open("POST", uploadURL, true)
    xhr.withCredentials = true
    xhr.setRequestHeader("filename", currentFile.name)
    xhr.addEventListener("load", (event) => {
      setFilesToBeUploaded((prev) => {
        return prev.map((f) => {
          if (f.id === currentFile.id) {
            return { ...f, isUploaded: true }
          }
          return f
        })
      })

      xhr.onerror = () => {
        console.error("Error uploading file:", xhr.statusText)
      }
      UploadFiles(leftOver)
      getFiles()
    })
    xhr.upload.addEventListener("progress", (event) => {
      const loaded = (event.loaded / event.total) * 100
      setFilesToBeUploaded((prev) => {
        return prev.map((f) => {
          if (f.id === currentFile.id) {
            return { ...f, progress: loaded }
          }
          return f
        })
      })
    })
    xhr.send(currentFile.file)
  }

  // UPDATING FileNAME
  const updateRename = async () => {
    if (!reName.filename) {
      return alert("fileName cannot be Empty")
    }
    const res = await fetch(URL + `/file/${reName.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "Application/json",
      },
      body: JSON.stringify({ newFileName: reName.filename }),
      credentials: "include",
    })
    const data = await res.text()

    console.log(data)
    getFiles()
    setIsRenameEnabled(false)
    setRename({ id: "", filename: "" })
  }
  //DELETing FILE
  const handleDelete = async (id) => {
    const res = await fetch(URL + `/file/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
    const data = await res.json()
    getFiles()
  }

  //Creating Directory
  const handleCreateDirectory = async () => {
    if (!newDirectoryName) {
      return alert("Directory Name connot be empty")
    }

    const res = await fetch(
      URL + `/directory/${directoryId ? directoryId : ""}`,
      {
        method: "POST",
        headers: { "Content-Type": "Application/json" },
        body: JSON.stringify({ newDirectoryName }),
        credentials: "include",
      }
    )
    console.log(await res.text())
    getFiles()
    setNewDirectoryName("")
    setCreateDirModel(false)
  }
  //Updating Directory Name
  const updateDirRename = async () => {
    if (!reName.filename) {
      return alert("fileName/FolderName cannot be Empty")
    }
    const res = await fetch(URL + `/directory/${reName.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "Application/json",
      },
      body: JSON.stringify({ newDirName: reName.filename }),
      credentials: "include",
    })
    const data = await res.text()

    getFiles()
    setIsDirRenameEnabled(false)
    setRename({ id: "", filename: "" })
  }

  //READING DIRECTORY
  const getFiles = async () => {
    try {
      const res = await fetch(
        URL + `/directory/${directoryId ? directoryId : ""}`,
        {
          credentials: "include",
        }
      )

      const { status, data, error } = await res.json()
      if (status !== 200) {
        throw new Error(error)
      }
      setDirectoryData(data)
    } catch (error) {
      navigate("/login")
    }
  }

  //Deleting Directory
  const handleDirDelete = async (dirId) => {
    const res = await fetch(URL + `/directory/${dirId}`, {
      method: "DELETE",
      credentials: "include",
    })
    const data = await res.json()
    getFiles()
  }

  function getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase()
    switch (ext) {
      case "pdf":
        return "pdf"
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return "image"
      case "mp4":
      case "mov":
      case "avi":
        return "video"
      case "zip":
      case "rar":
      case "tar":
      case "gz":
        return "archive"
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "html":
      case "css":
      case "py":
      case "java":
        return "code"
      default:
        return "alt"
    }
  }

  const filesInput = useRef()

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 space-y-6 ">
        <h1 className="text-3xl font-bold text-gray-800"></h1>
        <DriveHeader
          setCreateDirModel={setCreateDirModel}
          filesInput={filesInput}
          handleUpload={handleUpload}
          dirName={directoryData?.dirName}
        />
        {/* {DriveComponent} */}
        <Drive
          getFileIcon={getFileIcon}
          directoryData={directoryData}
          URL={URL}
          setIsRenameEnabled={setIsRenameEnabled}
          setRename={setRename}
          setIsDirRenameEnabled={setIsDirRenameEnabled}
          handleDelete={handleDelete}
          handleDirDelete={handleDirDelete}
          deleteDetails={deleteDetails}
          setDeleteDetails={setDeleteDetails}
        />
        {isRenameEnabled && (
          <FileRenameModal
            reName={reName}
            setRename={setRename}
            setIsRenameEnabled={setIsRenameEnabled}
            updateRename={updateRename}
          />
        )}

        {isDirRenameEnabled && (
          <DirRenamModel
            reName={reName}
            updateDirRename={updateDirRename}
            setRename={setRename}
            setIsDirRenameEnabled={setIsDirRenameEnabled}
          />
        )}
        {createDirModel && (
          <CreateNewDirModel
            newDirectoryName={newDirectoryName}
            setNewDirectoryName={setNewDirectoryName}
            setCreateDirModel={setCreateDirModel}
            handleCreateDirectory={handleCreateDirectory}
          />
        )}

        {openUploadModel && (
          <UploadDialogueBox
            filesToBeUploaded={filesToBeUploaded}
            setIsOpenUploadModel={setIsOpenUploadModel}
          />
        )}
      </div>
    </>
  )
}

export default DirectoryView
