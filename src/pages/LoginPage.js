// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Form.css";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("로그인 성공");
    navigate("/");
  };

  return (
    <div className="form-container">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="아이디" onChange={handleChange} required /><br />
        <input type="password" name="password" placeholder="비밀번호" onChange={handleChange} required /><br />
        <button type="submit" className="primary-button">로그인</button>
      </form>
    </div>
  );
}
