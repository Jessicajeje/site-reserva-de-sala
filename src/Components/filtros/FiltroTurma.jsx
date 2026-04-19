import React from "react";
import { Input, Menu } from "semantic-ui-react";

const FiltroTurma = ({ setBuscaCurso, setBuscaPeriodo }) => {
  return (
    <Menu secondary style={{ marginBottom: '20px' }}>
      <Menu.Item>
        <Input 
          icon="search" 
          placeholder="Filtrar curso..." 
          onChange={(e) => setBuscaCurso(e.target.value)} 
        />
      </Menu.Item>
      <Menu.Item>
        <Input 
          icon="clock" 
          placeholder="Filtrar período..." 
          onChange={(e) => setBuscaPeriodo(e.target.value)} 
        />
      </Menu.Item>
    </Menu>
  );
};

export default FiltroTurma;