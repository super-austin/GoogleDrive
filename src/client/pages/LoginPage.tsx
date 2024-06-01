import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      localStorage.setItem("rootPath", "");
      navigate("/");
    }
  }, []);

  const handleSubmit = async () => {
    if (email === "" || password === "") {
      setError("Please fill in all fields");
    }
    try {
      const { data } = await axios.post("/api/user/login", {
        email,
        password,
      });
      const { isSuccess, token, error } = data;
      console.log(isSuccess, token, error);
      if (isSuccess) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", email);
        navigate("/");
      } else {
        console.error(error);
      }
    } catch (err) {
      switch (err.response.status) {
        case 404:
          setError("Error does not exist");
          break;
        case 400:
          setError("Incorrect password");
          break;
        case 500:
          setError("Server Error");
          break;
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: "8px",
          border: "1px solid black",
        }}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          padding: "8px",
          border: "1px solid black",
        }}
      />
      {error && <span>{error}</span>}
      <button
        style={{
          padding: "8px",
          backgroundColor: "rgb(37, 99, 235)",
          color: "white",
        }}
        onClick={handleSubmit}
      >
        Log In
      </button>
    </div>
  );
};

export default LoginPage;
