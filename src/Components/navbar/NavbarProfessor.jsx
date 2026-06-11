import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaSignOutAlt, FaBell, FaUser } from "react-icons/fa";
import { logout } from "../../views/util/AuthenticationService";

export default function Navbar() {
 const navigate = useNavigate();
 const location = useLocation();

 const [hovered, setHovered] = useState(null);

 const menuItems = [
 { path: "/home", icon: <FaHome />, label: "Início" },
 { path: "/notificacoes", icon: <FaBell />, label: "Notificações" },
 { path: "/autenticacao", icon: <FaUser />, label: "Autenticação de professores" },
 { path: "/perfil", icon: <FaUser />, label: "Perfil" },

 ];

  const handleLogoutClick = () => {
    logout(); 
    navigate("/");
  };

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
      flexDirection: "column",
      justifyContent: "space-between" // Empurra o rodapé para o final da tela
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

    footer: {
      borderTop: "1px solid rgba(255, 255, 255, 0.1)", // Linha sutil divisória
      paddingBottom: "10px"
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
      {/* Bloco de Navegação Superior */}
      <div>
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

      {/* Bloco do Botão de Sair no Rodapé */}
      <div style={styles.footer}>
        <button
          style={styles.button("logout", null)}
          onClick={handleLogoutClick} // Chama a função que criamos acima
          onMouseEnter={() => setHovered("logout")}
          onMouseLeave={() => setHovered(null)}
        >
          <FaSignOutAlt />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}