import React from "react"

const UploadDialogueBox = ({ filesToBeUploaded, setIsOpenUploadModel }) => {
  const noOfFilesUploaded = filesToBeUploaded.filter((f) => f.isUploaded).length

  return (
    <div className="w-full max-w-lg absolute bottom-0 right-5 nn  overflow-hidden     shadow-lg rounded-lg ">
      {/* {HEADING PART} */}
      <div className="p-4 bg-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold px-2">
          {noOfFilesUploaded}/{filesToBeUploaded.length}uploads complete
        </h3>

        <div className="flex space-x-3 items-center">
          {/* Close Icon */}
          <button
            className="text-gray-600 hover:text-red-600 text-xl"
            onClick={() => setIsOpenUploadModel(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* FILES PATH */}
      <div className="px-4 py-2">
        {filesToBeUploaded.map(({ name, isUploaded, progress }, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 border-b last:border-none"
          >
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">📄</span>
              <span className="text-sm">{name}</span>
            </div>

            <div className="w-10 h-4 flex items-center justify-center">
              {!isUploaded ? (
                <div className="w-6 h-2 bg-gray-300 rounded overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              ) : (
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UploadDialogueBox
