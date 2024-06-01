import mongoose from "mongoose";

const File = mongoose.model(
  "File",
  new mongoose.Schema({
    filename: String,
    path: String,
    data: Buffer,
    contentType: String,
    username: String,
    removedAt: Number,
  })
);

export default File;
