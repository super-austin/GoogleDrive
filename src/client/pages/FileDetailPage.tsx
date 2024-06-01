import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface FileProps {
  filename: string;
  data: {
    type: string;
    data: Array<number>;
  };
  sharedUserName: Array<string>;
  contentType: string;
  username: string;
  _id: string;
}

const FileDetailPage = () => {
  const { fileId } = useParams();
  const [file, setFile] = useState<FileProps>();
  const [fileContent, setFileContent] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!fileId) return;
    axios.get(`/api/file/${fileId}`).then(({ data }) => setFile(data));
  }, [fileId]);

  useEffect(() => {
    if (file?.contentType.includes("image")) {
      axios
        .get(`/api/file/image/${file._id}`, {
          responseType: "arraybuffer",
        })
        .then((response) => {
          const base64 = btoa(
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );

          setFileContent(
            `data:${response.headers["content-type"]};base64,${base64}`
          );
        })
        .catch((err) => console.error(err));
    } else if (file?.contentType.includes("text")) {
      axios
        .get(`/api/file/text/${file._id}`)
        .then((response) => {
          setFileContent(response.data);
        })
        .catch((err) => console.error(err));
    }
  }, [file]);

  if (!file) return <h1>Invalid file</h1>;

  const user = localStorage.getItem("user");

  if (
    file &&
    file.username !== user &&
    !file.sharedUserName.includes(user || "")
  ) {
    navigate("/");
  }

  return (
    <div>
      <h1>File Detail</h1>
      <h4>
        Title:
        <span>{file.filename}</span>
      </h4>
      <h4>Content Type: {file.contentType}</h4>

      {file.contentType.includes("image") && <img src={fileContent} />}
      {file.contentType.includes("text") && (
        <>
          <br />
          <div>{fileContent}</div>
        </>
      )}
    </div>
  );
};

export default FileDetailPage;
