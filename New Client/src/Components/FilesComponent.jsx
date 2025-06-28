import React from "react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { Link } from "react-router-dom"
import { URL } from "../constants"

function FilesComponent({
  directoryData,
  renderFileIcon,
  getFileIcon,
  setOpenContextMenu,
  handleContextCoord,
  setRename,
  setDeleteDetails,
}) {


  const navigateToFiles = (id)=>{
    window.location.href=URL + `/file/${id}`
  }

  return (
    <div className="space-y-2">
      {directoryData &&
        directoryData.files.map(({ id, filename }) => {
          return (
            <div
              key={id}
              className="flex gap-4 justify-between items-center bg-white p-3 cursor-pointer rounded border"
            >
              <div
                onClick={()=>navigateToFiles(id)}
                className="flex grow space-x-2 items-center"
              >
                <span>{renderFileIcon(getFileIcon(filename))}</span>
                <span>{filename}</span>
              </div>
              <button
                className="cursor-pointer hover:bg-gray-100"
                onClick={(e) => {
                  setOpenContextMenu({
                    isDirectory: false,
                    isContextMenuOpen: true,
                  })
                  setRename({ id, filename })
                  setDeleteDetails({ type: "file", id })
                  handleContextCoord(e)
                }}
              >
                <BsThreeDotsVertical className="text-xl" />
              </button>
            </div>
          )
        })}
    </div>
  )
}

export default FilesComponent
