import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import FileDetailPage from "./pages/FileDetailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/file/:fileId" element={<FileDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
