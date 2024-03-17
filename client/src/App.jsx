
import { Icon } from "@iconify/react";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import "animate.css";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SERVER_URL = "http://localhost:3001/"

function ListUploadsContainer({ setShowUploads }) {
  const [data, setData] = useState([]);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [photoViewerUrl, setPhotoViewerUrl] = useState("");


  useEffect(() => {
    fetch(`${SERVER_URL}list`)
      .then((res) => res.json())
      .then((data) => {
        setData(data.images);
      });
  });

  return (
    <div className="w-full h-screen fixed flex top-0 left-0 items-center justify-center bg-gray-100 ">
      <button
        onClick={() => setShowUploads(false)}
        className="absolute top-0 right-0 p-4 w-full h-full bg-gray-300"
      />
      <button
        onClick={() => setShowUploads(false)}
        className="absolute top-2 right-2 w-14 h-14 bg-gray-300 hover:bg-gray-700 z-[1001] text-gray-700 hover:text-gray-300 duration-200 text-2xl text-center rounded-lg"
      ><Icon icon="material-symbols:close" className="self-center w-full h-full p-4"/>
      </button>
      <div className="w-full relative z-[1000] h-full flex flex-col items-center p-4 bg-gray-100 shadow-lg rounded-xl">
        <h2 className="text-2xl text-center mb-8 uppercase tracking-[0.24em]">
          所有照片
        </h2>
        <div className="w-full h-full overflow-y-auto grid xl:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-2">
          {data.map((item) => (
            <div className="bg-gray-300 rounded-lg shadow-md flex-grow hover:shadow-xl hover:backdrop-filter duration-200" onClick={() => {setPhotoViewerUrl(`${SERVER_URL}${item.path}`);setShowPhotoViewer(true);}}>
              <img
                src={`${SERVER_URL}${item.path}`}
                className="h-full w-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
      {showPhotoViewer && <PhotoViewer photoUrl={photoViewerUrl} />}
    </div>
  );
}

function PhotoViewer(photoUrl) {
  console.log(photoUrl)
  return (
    <img src={photoUrl}></img>
  )

}

function UploadFileZone({ uploadFile, error, setError }) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/gif": [".gif"],
      "image/svg+xml": [".svg"],
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length) {
        uploadFile(acceptedFiles[0]);
        return;
      }
      toast.error('不支持此档案格式！', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored"
        });
    },
  });

  const openFileDialog = () => {
    document.getElementById("file-input").click();
  };

  return (
    <>
      <h1 className="text-center text-2xl font-medium tracking-[0.1rem] ">
        高三理2班聚 照片集中营
      </h1>
      <p className="text-center text-xs mt-4">支持格式 JPEG, PNG, ...</p>
      <div
        {...getRootProps({
          className: `dropzone border-2 ${
            error
              ? "border-rose-500 hover:bg-rose-500"
              : "border-gray-500 hover:bg-gray-500"
          } aspect-video mt-12 border-dashed flex flex-col items-center justify-center w-full cursor-pointer transition-colors hover:text-zinc-900`,
        })}
      >
        <Icon
          icon="uil:image-upload"
          className="w-12 h-12 stroke-[0.4px] stroke-zinc-900"
        />
        <p className="text-sm mt-4 font-medium">拖放至这里</p>
        <input {...getInputProps()} />
      </div>
      <span className="font-medium text-center mt-6">或</span>
      <button
        onClick={openFileDialog}
        className={`w-full border-2 border-gray-500 hover:bg-gray-500 hover:text-gray-100 font-medium py-4 mt-6 tracking-[0.2rem] !text-sm rounded-lg duration-200`}
      >
        从相册中选择照片
      </button>
      <input
        id="file-input"
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files.length) {
            if (
              [".png", ".jpg", ".jpeg", ".gif", ".svg"].includes(
                e.target.files[0].type
              )
            ) {
              uploadFile(e.target.files[0]);
              return;
            }
            setError(true);
            setTimeout(() => {
              setError(false);
            }, 1000);
          }
        }}
        className="hidden"
      />
    </>
  );
}

function App() {
  const [error, setError] = useState(false);
  const [showUploads, setShowUploads] = useState(false);

  const uploadFile = async (file) => {
    toast('准备上传...', {
      toastId: "uploaderToast",
      position: "top-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored"
      });


    toast.update("uploaderToast", {
      render: "正在上传...",
      icon: <Icon icon="line-md:loading-loop" />
    });
    try{
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${SERVER_URL}upload`, {
        method: "POST",
        body: formData,
      });
      if (response.status === 200) {
        const res = await response.json();
        if (res.message === "success") {
          toast.update("uploaderToast", {
            render: "上传成功！",
            type: "success",
            autoClose: 3000
          });
          return;
        } 
      } 
    } catch(error) {
      toast.update("uploaderToast", {
        render: "上传失败！",
        type: "error",
        icon:<Icon icon="icon-park-solid:error" />,
        autoClose: 3000
      });
    }
  };

  return (
    <main className={`w-full px-8 h-screen bg-gray-100 text-gray-900 flex flex-col items-center justify-center pb-10 font-sans`}>
      <div>
        <ToastContainer autoClose={1} />
      </div>
      <div
        className={`w-full sm:w-8/12 lg:w-5/12 max-h-[calc(100%-8rem)] border-2 animate__animated animate__fast shadow-xl rounded-xl p-8 flex flex-col items-center`}
      >
            <UploadFileZone
              key={0}
              uploadFile={uploadFile}
              setError={setError}
              error={error}
            />
      </div>
      <button
        type="button"
        onClick={() => setShowUploads(true)}
        className="tracking-[0.2em] font-medium text-sm mt-4 py-4 w-full sm:w-8/12 lg:w-5/12 shadow-lg rounded-lg bg-white hover:bg-gray-500 hover:text-gray-100 duration-200"
      >
        查看所有照片
      </button>
      {showUploads && <ListUploadsContainer setShowUploads={setShowUploads} />}
    </main>
  );
}

export default App;
