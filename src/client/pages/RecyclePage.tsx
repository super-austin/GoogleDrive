import { FC, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface FileItem {
  _id: string;
  filename: string;
  path: string;
  contentType: string;
  removedAt: number;
}

const RecyclePage: FC = () => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [rootPath, setRootPath] = useState("");
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
      .get(`/api/file/recycled?root=${rootPath}`, {
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

  const restoreItem = async (item: FileItem) => {
    const keyword =
      rootPath === "" ? item.filename : `${rootPath}/${item.filename}`;

    console.log(localStorage.getItem("user"));

    axios
      .put(
        `/api/file/restore?keyword=${keyword}`,
        {},
        {
          headers: {
            authorization: localStorage.getItem("user") || "",
          },
        }
      )
      .then(async () => await fetchData())
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <div>
        <h2>Files</h2>
        <table>
          <thead>
            <tr>
              <td>Type</td>
              <td>File</td>
              <td>Path</td>
              <td>Removed At</td>
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
                <td>{item.filename}</td>
                <td>
                  ./
                  {item.contentType !== "directory"
                    ? item.path
                    : rootPath === ""
                    ? item.filename
                    : `${rootPath}/${item.filename}`}
                </td>
                <td>{new Date(item.removedAt).toLocaleString("en-US")}</td>
                <td>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      restoreItem(item);
                    }}
                  >
                    Restore
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecyclePage;
