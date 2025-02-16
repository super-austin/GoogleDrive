import { FC, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface FileItem {
  _id: string;
  filename: string;
  path: string;
  contentType: string;
}

const MainPage: FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<FileItem[]>([]);
  const [rootPath, setRootPath] = useState("");
  const [editingId, setEditingId] = useState("");
  const [newName, setNewName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }

    const savedLocalStorage = localStorage.getItem("rootPath");
    setRootPath(savedLocalStorage || "");
  }, []);

  useEffect(() => {
    fetchData();

    console.log(rootPath);
    localStorage.setItem("rootPath", rootPath);
  }, [rootPath]);

  const fetchData = async () => {
    axios
      .get(`/api/file?root=${rootPath}`, {
        headers: {
          authorization: localStorage.getItem("user") || "",
        },
      })
      .then(({ data }) => {
        setItems(data.files);
      })
      .catch((err) => {
        console.error("Error fetching file information");
      });
  };

  const onFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    isDirectory: boolean
  ) => {
    const files = event.target.files;
    if (files) {
      setFiles(
        Array.from(files).map((file) => ({
          file: file,
          path: isDirectory
            ? (file as any).webkitRelativePath || file.name
            : file.name,
        }))
      );
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) return alert("Please select a file or folder.");

    const formData = new FormData();
    files.forEach(({ file }) => {
      formData.append("files", file);
    });
    formData.append("paths", JSON.stringify(files.map(({ path }) => path)));

    try {
      const response = await axios.post("/api/file/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          authorization: localStorage.getItem("user") || "",
        },
      });

      setFiles([]);
    } catch (error) {
      alert(
        "Error uploading files: " + (error.response?.data || error.message)
      );
    }
  };

  const removeItem = async (item: FileItem) => {
    const keyword =
      rootPath === "" ? item.filename : `${rootPath}/${item.filename}`;
    axios
      .delete(`/api/file?keyword=${keyword}`, {
        headers: {
          authorization: localStorage.getItem("user") || "",
        },
      })
      .then(async () => await fetchData())
      .catch((err) => console.error(err));
  };

  const downloadItem = async (item: FileItem) => {
    const keyword =
      rootPath === "" ? item.filename : `${rootPath}/${item.filename}`;

    if (item.contentType === "directory") {
      axios
        .get(`/api/download/download?keyword=${keyword}`, {
          responseType: "blob",
          headers: {
            authorization: localStorage.getItem("user") || "",
          },
        })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "files.zip"); // Specify the filename to download
          document.body.appendChild(link);
          link.click();

          // Clean up and revoke the URL object
          link.remove();
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => console.error("Download error:", error));
    } else {
      axios
        .get(`/api/download/download/${item._id}`, {
          responseType: "blob",
        })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", item.filename); //or any other extension
          document.body.appendChild(link);
          link.click();

          // Clean up and remove the link
          link.parentNode?.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => console.error("Download error:", error));
    }
  };

  const compressItem = async (item: FileItem) => {
    const keyword =
      rootPath === "" ? item.filename : `${rootPath}/${item.filename}`;

    await axios.get(`/api/download/compress?keyword=${keyword}`, {
      responseType: "blob",
      headers: {
        authorization: localStorage.getItem("user") || "",
      },
    });

    await fetchData();
  };

  const submitRename = async (item: FileItem, newName: string) => {
    await axios.put(`/api/file/${item._id}`, { filename: newName });
  };

  return (
    <div>
      <div
        id="Upload Pad"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div>
          <span>File Upload: </span>
          <input
            type="file"
            onChange={(e) => onFileChange(e, false)}
            multiple
          />
        </div>
        <div>
          <span>Folder Upload: </span>
          <input
            type="file"
            webkitdirectory="true"
            directory="true"
            onChange={(e) => onFileChange(e, true)}
          />
        </div>
        <button onClick={uploadFiles}>Upload</button>
      </div>
      <div>
        <h2>Files</h2>
        <table>
          <thead>
            <tr>
              <td>Type</td>
              <td>File</td>
              <td>Path</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {rootPath !== "" && (
              <tr
                onClick={() => {
                  const chunks = rootPath.split("/");
                  setRootPath(chunks.slice(0, chunks.length - 1).join("/"));
                }}
              >
                <td>..</td>
                <td>..</td>
                <td>..</td>
                <td></td>
              </tr>
            )}
            {items.map((item) => (
              <tr
                key={item._id}
                onClick={() => {
                  if (item.contentType === "directory") {
                    const newRootPath =
                      rootPath === ""
                        ? item.filename
                        : `${rootPath}/${item.filename}`;
                    setRootPath(newRootPath);
                  } else {
                    navigate(`/file/${item._id}`);
                  }
                }}
              >
                <td>
                  {item.contentType === "directory" ? "directory" : "file"}
                </td>
                <td>
                  {editingId === item._id ? (
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(newName)}
                      onFocus={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          submitRename(item, newName);
                          setNewName("");
                          setEditingId("");
                        }
                      }}
                    />
                  ) : (
                    item.filename
                  )}
                </td>
                <td>
                  ./
                  {item.contentType !== "directory"
                    ? item.path
                    : rootPath === ""
                    ? item.filename
                    : `${rootPath}/${item.filename}`}
                </td>
                <td>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item);
                    }}
                  >
                    Remove
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadItem(item);
                    }}
                  >
                    Download
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      compressItem(item);
                    }}
                  >
                    Compress
                  </button>
                  {item.contentType !== "directory" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(item._id);
                        setNewName(item.filename);
                      }}
                    >
                      Rename
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MainPage;
