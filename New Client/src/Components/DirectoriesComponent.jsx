import React, { Fragment } from "react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FaFolder } from "react-icons/fa"
import { Link } from "react-router-dom"

function DirectoriesComponent({
  directoryData,
  setOpenContextMenu,
  handleContextCoord,
  setRename,
  setDeleteDetails,
}) {
  return (
    <div className="space-y-2">
      {directoryData &&
        directoryData.folders.map(({ id, dirName }) => {
          return (
            <Fragment key={id}>
              <div className="flex justify-between items-center  p-3 rounded border shadow-sm">
                <Link
                  to={`/${id}`}
                  className="flex grow  space-x-2 items-center cursor-pointer"
                >
                  <span>
                    <FaFolder className="folder-icon text-yellow-500 text-lg" />
                  </span>
                  <span className="font-medium">{dirName}</span>
                </Link>
                <button
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={(e) => {
                    setOpenContextMenu({
                      isDirectory: true,
                      isContextMenuOpen: true,
                    })
                    setRename({ id, filename: dirName })
                    setDeleteDetails({ type: "directory", id: id })
                    handleContextCoord(e)
                  }}
                >
                  <BsThreeDotsVertical className="text-xl" />
                </button>
              </div>
            </Fragment>
          )
        })}
    </div>
  )
}

export default DirectoriesComponent
