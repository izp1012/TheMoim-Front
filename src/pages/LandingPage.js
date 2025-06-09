// src/pages/LandingPage.js
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Landing.css";

export default function LandingPage() {
  return (
    <div className="landing-container">
      <h1>모임 관리 앱</h1>
      <div className="menu">
        <Link className="menu-button" to="/groups">그룹 관리</Link>
        <Link className="menu-button" to="/payments">회비 등록</Link>
        <Link className="menu-button" to="/payments/1">1번 그룹 회비 내역</Link>
      </div>
    </div>
  );
}