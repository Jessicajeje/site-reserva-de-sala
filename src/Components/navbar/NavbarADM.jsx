import { useState } from "react";
import {  FaHome, FaChalkboardTeacher, FaSchool, FaBook, FaUserCircle } from "react-icons/fa";

import { useLocation, useNavigate } from "react-router-dom";


export default function Navbar() {
 const navigate = useNavigate();
 const location = useLocation();

 const [hovered, setHovered] = useState(null);

const menuItems = [
  { path: "/validar-prof", icon: <FaHome />, label: "Início" },
  { path: "/turmas", icon: <FaChalkboardTeacher />, label: "Turmas" },
  { path: "/salas", icon: <FaSchool />, label: "Salas / Laboratórios" },
  { path: "/disciplinas", icon: <FaBook />, label: "Disciplinas" },
  { path: "/professores-ativos", icon: <FaUserCircle />, label: "Professores Ativos" }
];

 const styles = {
 navbar: {
 width: "220px",
 height: "100vh",
 backgroundColor: "#e3f7dd",
 color: "#3b6430",
 position: "fixed",
 top: 0,
 left: 0,
 display: "flex",
 flexDirection: "column"
 },

 header: {
 padding: "20px",
 fontSize: "20px",
 fontWeight: "bold"
 },

 menu: {
 listStyle: "none",
 padding: 0,
 margin: 0
 },

 button: (index, path) => {
 const isActive = location.pathname === path;

 return {
 width: "100%",
 display: "flex",
 alignItems: "center",
 gap: "10px",
 padding: "15px 20px",
     backgroundColor:
       isActive || hovered === index
         ? "rgba(59, 100, 48, 0.2)" // Verde escuro com transparência
         : "transparent",
 color: "#3b6430",
 border: "none",
 cursor: "pointer",
 textAlign: "left",
 fontSize: "14px"
 };
 }
 };

 return (
 <div style={styles.navbar}>
 <div style={styles.header}>ADM</div>

 <ul style={styles.menu}>
 {menuItems.map((item, index) => (
 <li key={index}>
 <button
 style={styles.button(index, item.path)}
 onClick={() => navigate(item.path)}
 onMouseEnter={() => setHovered(index)}
 onMouseLeave={() => setHovered(null)}
 >
 {item.icon}
 <span>{item.label}</span>
 </button>
 </li>
 ))}
 </ul>
 </div>
 );
}