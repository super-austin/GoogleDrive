import { Router } from "express";
import File from "../models/file";
import JSZip from "jszip";

const router = Router();

router.get("/health", (req, res) => {
  return res.send("API is working");
});

router.get("/download", async (req, res) => {
  const { keyword } = req.query;
  const username = req.headers.authorization;

  console.log(keyword, username);

  try {
    const files = (await File.find({ username, removedAt: 0 })).filter(
      ({ path }) => {
        return path?.includes((keyword as string) || "");
      }
    );

    if (!files.length) {
      return res
        .status(404)
        .json({ isSuccess: false, error: "File not found" });
    }

    const chunks = ((keyword as string) || "").split("/");
    let folderName = (keyword as string) || "";
    if (chunks[chunks.length - 1].includes(".")) {
      folderName = chunks.slice(0, chunks.length - 1).join("/");
    }

    console.log(folderName);

    const zip = new JSZip();
    const folder = zip.folder(folderName);

    files.forEach((file) => {
      const fileData = Buffer.from(file.data || "");
      folder!.file((file.path || "").slice(folderName.length + 1), fileData);
    });

    zip.generateAsync({ type: "nodebuffer" }).then(function (content) {
      res.type("application/zip");
      res.attachment("download.zip"); // This sets the filename for the downloaded zip
      res.send(content);
    });
  } catch (err) {
    return res.status(500).json({ isSuccess: false, error: err });
  }
});

router.get("/download/:id", async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id });
    if (!file) {
      return res
        .status(404)
        .json({ isSuccess: false, error: "File not found" });
    }
    res.set("Content-Type", file.contentType || "");
    return res.send(file.data);
  } catch (err) {
    return res.status(500).json(err);
  }
});

export { router };
