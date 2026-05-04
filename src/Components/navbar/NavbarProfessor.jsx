import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaChalkboardTeacher, FaBell, FaUser } from "react-icons/fa";

export default function Navbar() {
 const navigate = useNavigate();
 const location = useLocation();

 const [hovered, setHovered] = useState(null);

 const menuItems = [
 { path: "/home", icon: <FaHome />, label: "Início" },
 { path: "/reposicao", icon: <FaChalkboardTeacher />, label: "Reposição de aulas" },
 { path: "/notificacoes", icon: <FaBell />, label: "Notificações" },
 { path: "/autenticacao", icon: <FaUser />, label: "Autenticação de professores" },
 { path: "/perfil", icon: <FaUser />, label: "Perfil" }
 ];

 const styles = {
 navbar: {
 width: "220px",
 height: "100vh",
 backgroundColor: "#5DA348",
 color: "white",
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
 ? "rgba(0,0,0,0.2)"
 : "transparent",
 color: "white",
 border: "none",
 cursor: "pointer",
 textAlign: "left",
 fontSize: "14px"
 };
 }
 };

 return (
 <div style={styles.navbar}>
 <div style={styles.header}>DOCENTE</div>

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