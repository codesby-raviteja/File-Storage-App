import { Children, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

const URL = "http://localhost:5000" //Enter your  localhost

// const URL = "http://localhost/"
function DirectoryView() {
  const params = useParams()
  const directory = params["*"]
  const [files, setFiles] = useState()
  const [indicator, setIndicator] = useState()
  const [reName, setRename] = useState("")
  const [renameSet, setRenameSet] = useState({})
  useEffect(() => {
    getFiles(directory)
  }, [directory])

  const getFiles = async () => {
    const res = await fetch(URL + `/directory/${directory}`)
    const data = await res.json()
    const reNameObj = {}
    data.forEach((file) => (reNameObj[file] = false))
    setRenameSet(reNameObj)
    setFiles(data)
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    const uploadURL = URL + `/upload/${directory}`
    const xhr = new XMLHttpRequest()
    xhr.open("POST", uploadURL, true)
    xhr.setRequestHeader("fileName", file.name)
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

  const handleDelete = async (filename) => {
    const res = await fetch(URL + "/" + filename, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: directory }),
    })
    const data = await res.text()
    console.log(data)
    getFiles()
  }

  //HANDLING RENAME
  const handleRenameSet = (fileName) => {
    setRenameSet((prev) => ({ ...prev, [fileName]: true }))
    setRename(fileName)
  }
  //UPDATING RENAME
  const updateRename = async (fileName) => {
    if (!fileName) {
      return alert("fileName cannot be Empty")
    }
    const res = await fetch(URL + "/" + fileName, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newFileName: reName,
        path: directory,
      }),
    })
    const data = await res.text()

    console.log(data)
    getFiles()
    setRename("")
  }
  return (
    <>
      <div>
        <h3>Upload File Down here</h3>
        <input type="file" onChange={handleUpload} />
        {indicator && <span>Uploaded :{indicator}%</span>}

        <h3>Files On the server</h3>
        {files &&
          files.map(({ fileName, isDirectory }) => {
            return (
              <p key={fileName}>
                FileName: <span>{fileName}</span>{" "}
                {!isDirectory ? (
                  <>
                    <a
                      href={
                        URL + `/files/${fileName}?action=open&path=${directory}`
                      }
                    >
                      Open
                    </a>{" "}
                    <a
                      href={
                        URL +
                        `/files/${fileName}?action=download&path=${directory}`
                      }
                    >
                      Download
                    </a>
                  </>
                ) : (
                  <Link
                    to={
                      directory === ""
                        ? `/${fileName}`
                        : `/${directory}/${fileName}`
                    }
                  >
                    Open
                  </Link>
                )}
                {"      "}
                <button onClick={() => handleDelete(fileName)}>Delete</button>
                {"      "}
                <button onClick={() => handleRenameSet(fileName)}>
                  Rename
                </button>{" "}
                {renameSet[fileName] && (
                  <>
                    <input
                      type="text"
                      onChange={(e) => setRename(e.target.value)}
                      value={reName}
                    />{" "}
                    <span onClick={() => updateRename(fileName)}>OK</span>
                  </>
                )}
              </p>
            )
          })}
      </div>
    </>
  )
}

export default DirectoryView
