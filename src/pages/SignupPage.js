// src/pages/SignupPage.js
import React, { useState } from "react";
import "../styles/Form.css";

export default function SignupPage() {
    const [form, setForm] = useState({ username: "", password: "", email: "" });
  
    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      alert("회원가입 완료: " + JSON.stringify(form));
    };
  
    return (
      <div className="form-container">
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit}>
          <input name="username" placeholder="아이디" onChange={handleChange} required /><br />
          <input name="email" placeholder="이메일" onChange={handleChange} required /><br />
          <input type="password" name="password" placeholder="비밀번호" onChange={handleChange} required /><br />
          <button type="submit" className="primary-button">회원가입</button>
        </form>
      </div>
    );
  }