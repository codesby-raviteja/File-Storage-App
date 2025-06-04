import { Children, useEffect, useState } from "react"

const URL = "http://localhost:5000/" //Enter your  localhost

// const URL = "http://localhost/"
function App() {
  const [files, setFiles] = useState()
  const [indicator, setIndicator] = useState()
  const [reName, setRename] = useState("")
  const [renameSet, setRenameSet] = useState({})
  useEffect(() => {
    getFiles()
  }, [])

  const getFiles = async () => {
    const res = await fetch(URL)
    const data = await res.json()
    const reNameObj = {}
    data.forEach((file) => (reNameObj[file] = false))
    setRenameSet(reNameObj)
    setFiles(data)
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]

    const xhr = new XMLHttpRequest()
    xhr.open("POST", URL, true)
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

  const handleDelete = async (filePath) => {
    const res = await fetch(URL + filePath, { method: "DELETE" })
    const data = await res.text()
    console.log(data)
    getFiles()
  }

  // const downloadFile = async (file) => {
  //   // const response = await fetch(URL + `${file}?mode=download`, {
  //   //   method: "GET",
  //   // })

  //   // const blob = await response.blob()
  //   // const url = window.URL.createObjectURL(blob)
  //   // const link = document.createElement("a")
  //   // link.href = url
  //   // link.setAttribute("download", file)
  //   // document.body.appendChild(link)
  //   // link.click()
  //   // link.remove()
  //   // console.log("Hello world")
  //   try {
  //     const response = await fetch(URL + `download/${file}`, {
  //       method: "GET",
  //     })

  //     if (!response.ok) throw new Error("Network response was not ok")

  //     const blob = await response.blob() // Stream gets converted to blob
  //     const url = window.URL.createObjectURL(blob)

  //     const a = document.createElement("a")
  //     a.href = url

  //     // Optional: Get filename from headers

  //     a.download = file
  //     document.body.appendChild(a)
  //     a.click()
  //     a.remove()
  //     URL.revokeObjectURL(url)
  //   } catch (err) {
  //     console.error("Download failed", err)
  //   }
  // }

  const handleRenameSet = (fileName) => {
    setRenameSet((prev) => ({ ...prev, [fileName]: true }))
    setRename(fileName)
  }
  const updateRename = async (fileName) => {
    if (!fileName) {
      return alert("fileName cannot be Empty")
    }
    const res = await fetch(URL + fileName, {
      method: "PATCH",
      headers: {
        rename: reName,
      },
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
          files.map((file) => {
            return (
              <p key={file}>
                FileName: <span>{file}</span>{" "}
                <a href={URL + `preview/${file}`}>Open</a>{" "}
                {file.includes(".") ? (
                  <a href={URL + `download/${file}`}>Download</a>
                ) : (
                  "  "
                )}{" "}
                {"      "}
                <button onClick={() => handleDelete(file)}>Delete</button>
                {"      "}
                <button onClick={() => handleRenameSet(file)}>
                  Rename
                </button>{" "}
                {renameSet[file] && (
                  <>
                    <input
                      type="text"
                      onChange={(e) => setRename(e.target.value)}
                      value={reName}
                    />{" "}
                    <span onClick={() => updateRename(file)}>OK</span>
                  </>
                )}
              </p>
            )
          })}
      </div>
    </>
  )
}

export default App
