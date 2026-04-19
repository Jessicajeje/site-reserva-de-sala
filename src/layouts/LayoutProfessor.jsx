import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarProfessor from '../Components/navbar/NavbarADM';

const LayoutProfessor = () => {
  return (
    <>
      <NavbarProfessor />
        <main style={{ 
      flex: 1, 
      marginLeft: '250px',
      padding: '20px',
      minHeight: '100vh' 
    }}>
      <Outlet />
    </main>
    </>
  );
};

export default LayoutProfessor;
