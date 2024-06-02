import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import FileDetailPage from "./pages/FileDetailPage";
import RecyclePage from "./pages/RecyclePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recycle" element={<RecyclePage />} />
        <Route path="/file/:fileId" element={<FileDetailPage />} />
        <Route path="/" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
