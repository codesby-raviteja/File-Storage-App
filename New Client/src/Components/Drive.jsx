import React, { Fragment, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import DirectoriesComponent from "./DirectoriesComponent"
import FilesComponent from "./FilesComponent"
import {
  FaFileAlt,
  FaFileCode,
  FaFileImage,
  FaFilePdf,
  FaFileVideo,
} from "react-icons/fa"
import ContextMenu from "./ContextMenu"

function Drive({
  directoryData,
  getFileIcon,
  handleDelete,
  handleDirDelete,
  setIsRenameEnabled,
  setIsDirRenameEnabled,
  setRename,
  deleteDetails,
  setDeleteDetails,
}) {
  const [openContextMenu, setOpenContextMenu] = useState({
    isDirectory: false,
    isContextMenuOpen: false,
  })
  const [contextCoord, setContextCoord] = useState(null)

  const handleContextCoord = (e) => {
    e.stopPropagation()

    const x = e.clientX - 120
    const y = e.clientY
    const coordinates = { x, y }
    setContextCoord(coordinates)
  }

  useEffect(() => {
    const handleCloseContextMenu = (e) => {
      setOpenContextMenu({
        isDirectory: false,
        isContextMenuOpen: false,
      })
      setContextCoord(null)
    }
    window.addEventListener("click", handleCloseContextMenu)
    return () => {
      window.removeEventListener("click", handleCloseContextMenu)
    }
  }, [])

  function renderFileIcon(iconString) {
    switch (iconString) {
      case "pdf":
        return <FaFilePdf className="text-red-400 text-xl" />
      case "image":
        return <FaFileImage className="text-blue-500 text-xl" />
      case "video":
        return <FaFileVideo className="text-orange-500 text-xl" />
      case "archive":
        return <FaFileArchive />
      case "code":
        return <FaFileCode />
      case "alt":
      default:
        return <FaFileAlt />
    }
  }

  const handleDeletion = () => {
    const { type, id } = deleteDetails
    if (type === "directory") {
      handleDirDelete(id)
    } else {
      handleDelete(id)
    }
  }
  return (
    <>
      {" "}
      <DirectoriesComponent
        directoryData={directoryData}
        renderFileIcon={renderFileIcon}
        getFileIcon={getFileIcon}
        openContextMenu={openContextMenu}
        setOpenContextMenu={setOpenContextMenu}
        handleContextCoord={handleContextCoord}
        setRename={setRename}
        setDeleteDetails={setDeleteDetails}
      />
      <FilesComponent
        directoryData={directoryData}
        renderFileIcon={renderFileIcon}
        getFileIcon={getFileIcon}
        openContextMenu={openContextMenu}
        setOpenContextMenu={setOpenContextMenu}
        handleContextCoord={handleContextCoord}
        setRename={setRename}
        setDeleteDetails={setDeleteDetails}
      />
      {openContextMenu?.isContextMenuOpen && (
        <ContextMenu
          contextCoord={contextCoord}
          openContextMenu={openContextMenu}
          setIsRenameEnabled={setIsRenameEnabled}
          setIsDirRenameEnabled={setIsDirRenameEnabled}
          handleDeletion={handleDeletion}
        />
      )}
    </>
  )
}

export default Drive
