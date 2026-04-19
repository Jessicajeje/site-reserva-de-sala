import React from 'react';
import { Outlet } from 'react-router-dom';
import NavbarADM from '../Components/navbar/NavbarADM';

const LayoutADM = () => {
  return (
    <>
      <NavbarADM />
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

export default LayoutADM;
