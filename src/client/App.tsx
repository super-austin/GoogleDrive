import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<h1>Main Page</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
