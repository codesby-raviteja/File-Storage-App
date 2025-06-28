import { Fragment, useContext, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { userContext } from "./Context/userContext"

const URL = "http://localhost:5000" //Enter your  localhost

// const URL = "http://localhost/"
function DirectoryView() {
  const params = useParams()
  const directoryId = params["*"]
  const [directoryData, setDirectoryData] = useState()
  const [indicator, setIndicator] = useState()
  const [reName, setRename] = useState({ id: null, filename: "" })
  const [isDirRenameEnabled, setIsDirRenameEnabled] = useState(false)
  const [isRenameEnabled, setIsRenameEnabled] = useState(false)
  const [newDirectoryName, setNewDirectoryName] = useState("")

  const [user, setUser] = useContext(userContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate("/login")
    } else {
      getFiles()
    }
  }, [directoryId])

  //UPLOADING FILE
  const handleUpload = async (e) => {
    const file = e.target.files[0]
    const uploadURL = URL + `/file/upload/${directoryId}`
    const xhr = new XMLHttpRequest()
    xhr.open("POST", uploadURL, true)
    xhr.setRequestHeader("filename", file.name)
    xhr.addEventListener("load", (event) => {
      console.log(xhr.response)
      getFiles()
    })
    xhr.upload.addEventListener("progress", (event) => {
      const loaded = (event.loaded / event.total) * 100
      setIndicator(loaded.toFixed(0))
    })
    xhr.send(file)
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
    })
    const data = await res.json()
    getFiles()
  }

  //Creating Directory
  const handleCreateDirectory = async () => {
    if (!newDirectoryName) {
      return alert("Directory Name connot be empty")
    }

    const res = await fetch(URL + `/directory/${directoryId}`, {
      method: "POST",
      headers: { "Content-Type": "Application/json" },
      body: JSON.stringify({ newDirectoryName }),
    })
    console.log(await res.text())
    getFiles()
    setNewDirectoryName("")
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
    })
    const data = await res.text()

    getFiles()
    setIsDirRenameEnabled(false)
    setRename({ id: "", filename: "" })
  }

  //READING DIRECTORY
  const getFiles = async () => {
    console.log(directoryId);
    const res = await fetch(URL + `/directory/${directoryId}`)
    const data = await res.json()
    setDirectoryData(data)
  }

  //Deleting Directory
  const handleDirDelete = async (dirId) => {
    const res = await fetch(URL + `/directory/${dirId}`, { method: "DELETE" })
    const data = await res.json()
    console.log(data)
    getFiles()
  }

  if (!user) {
    return
  }


  console.log(user);

  return (
    <>
      <div>
        <h1>MY FILES</h1>
        <h2>Upload File Down here</h2>
        <input type="file" onChange={handleUpload} />
        {indicator && <span>Uploaded :{indicator}%</span>}

        <h2>Files On the server</h2>
        <h3>Folders</h3>
        <div>
          {directoryData &&
            directoryData.folders.map(({ id, dirName }) => {
              return (
                <Fragment key={id}>
                  <div>
                    <span>{dirName}</span>
                    <Link to={`/${id}`}>open</Link>
                    <span
                      onClick={() => {
                        setIsDirRenameEnabled(true)
                        setRename({ id, filename: dirName })
                      }}
                    >
                      Rename
                    </span>{" "}
                    <span onClick={() => handleDirDelete(id)}>Delete</span>
                  </div>
                  <br />
                </Fragment>
              )
            })}
        </div>
        <h3>Files</h3>
        {directoryData &&
          directoryData.files.map(({ id, filename }) => {
            return (
              <p key={id}>
                {filename} <a href={URL + `/file/${id}`}>open</a>{" "}
                <Link to={URL + `/file/${id}?action=download`}>Download</Link>{" "}
                <span onClick={() => handleDelete(id)}>Delete</span>
                {"    "}{" "}
                <span
                  onClick={() => {
                    setIsRenameEnabled(true)
                    setRename({ id, filename })
                  }}
                >
                  Rename
                </span>
              </p>
            )
          })}
        <h3>Creating Options:</h3>
        <p>
          <input
            type="text"
            id=""
            value={newDirectoryName}
            onChange={(e) => setNewDirectoryName(e.target.value)}
          />{" "}
          <button onClick={handleCreateDirectory}>Create Directory</button>
        </p>
        {isRenameEnabled && (
          <>
            <div className="overlay"></div>
            <div className="pop-up">
              <p>
                {" "}
                <input
                  type="text"
                  value={reName.filename}
                  onChange={(e) =>
                    setRename((prev) => ({ ...prev, filename: e.target.value }))
                  }
                />
              </p>
              <div className="buttons">
                <button onClick={updateRename}>Ok</button>
                <button onClick={() => setIsRenameEnabled(false)}>
                  Cancle
                </button>
              </div>
            </div>
          </>
        )}
        {isDirRenameEnabled && (
          <>
            <div className="overlay"></div>
            <div className="pop-up">
              <p>
                {" "}
                <input
                  type="text"
                  value={reName.filename}
                  onChange={(e) =>
                    setRename((prev) => ({ ...prev, filename: e.target.value }))
                  }
                />
              </p>
              <div className="buttons">
                <button onClick={updateDirRename}>Ok</button>
                <button onClick={() => setIsDirRenameEnabled(false)}>
                  Cancle
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default DirectoryView
