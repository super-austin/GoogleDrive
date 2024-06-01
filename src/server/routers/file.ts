import { Router } from "express";
import multer from "multer";
import File from "../models/file";

const storage = multer.memoryStorage();

const router = Router();

router.post("/upload", multer({ storage }).array("files"), async (req, res) => {
  if (!req.files) return res.status(400).send("No files uploaded.");

  console.log("b");

  try {
    const files = req.files as Express.Multer.File[];
    const paths = JSON.parse(req.body.paths as string); // Retrieve paths from formData

    // Process each file and path
    await Promise.all(
      files.map(async (file, index) => {
        const newFile = new File({
          filename: file.originalname,
          path: paths[index],
          data: file.buffer,
          contentType: file.mimetype,
          fileData: file.buffer,
          username: req.headers.authorization,
          removedAt: 0,
        });

        await newFile.save();
      })
    );

    return res
      .status(200)
      .json({ isSuccess: true, message: "Files uploaded and saved." });
  } catch (error) {
    return res.status(500).json({
      isSuccess: false,
      error,
    });
  }
});

router.get("/", async (req, res) => {
  const { root } = req.query;
  const rootPath = (root as string) || "";

  const username = req.headers.authorization;
  try {
    const files = (await File.find({ username, removedAt: 0 })).filter(
      ({ path }) => path?.includes(rootPath)
    );

    const result = [];

    files.forEach((file) => {
      let newRoot = file.path?.slice(rootPath.length, file.path.length) || "";
      if (newRoot[0].startsWith("/"))
        newRoot = newRoot?.slice(1, newRoot.length);
      if (newRoot.split("/").length === 1) {
        result.push(file);
      } else {
        const pathChunk = newRoot.split("/") || [];
        const name = pathChunk[0];
        if (result.findIndex((file) => file.filename === name) === -1) {
          result.push({
            _id: `directory_${name}`,
            filename: name,
            path: rootPath,
            contentType: "directory",
            username: file.username,
          });
        }
      }
    });

    return res.status(200).json({ isSuccess: true, files: result });
  } catch (err) {
    return res.status(500).json({
      isSuccess: false,
      error,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id });
    if (!file) {
      return res
        .status(404)
        .json({ isSuccess: false, error: "File not found" });
    }
    return res.status(200).json(file);
  } catch (err) {
    return res.status(500).json({
      isSuccess: false,
      error,
    });
  }
});

// router.get("/download/:id", async (req, res) => {
//   try {
//     const file = await File.findOne({ _id: req.params.id });
//     if (!file) {
//       return res
//         .status(404)
//         .json({ isSuccess: false, error: "File not found" });
//     }
//     res.set("Content-Type", file.contentType || "");
//     return res.send(file.data);
//   } catch (err) {
//     return res.status(500).json(err);
//   }
// });

router.delete("/", async (req, res) => {
  const { keyword } = req.query;
  const username = req.headers.authorization;

  console.log(keyword, username);

  try {
    const tfiles = await File.find({ username, removedAt: 0 });
    const files = tfiles.filter(({ path }) => {
      return path?.includes((keyword as string) || "");
    });

    await Promise.all(
      files.map(async (file, index) => {
        console.log(file);
        await File.findOneAndUpdate(
          { _id: file._id },
          {
            $set: {
              ...file.toObject(),
              removedAt: Date.now(),
            },
          },
          { new: true }
        );
      })
    );

    return res.status(200).json({ isSuccess: true });
  } catch (err) {
    return res.status(500).json({
      isSuccess: false,
      error: err,
    });
  }
});

router.get("/image/:id", async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id });
    if (!file) {
      return res
        .status(404)
        .json({ isSuccess: false, error: "Image not found" });
    }
    const imgBuffer = file.data;
    const contentType = file.contentType;
    res.set("Content-Type", contentType || "");
    res.send(imgBuffer);
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.get("/text/:id", async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id });
    if (!file) {
      return res
        .status(404)
        .json({ isSuccess: false, error: "Text not found" });
    }

    const textData = (file.data || "").toString("utf8");
    res.send(textData);
  } catch (err) {
    return res.status(500).json(err);
  }
});

export { router };
