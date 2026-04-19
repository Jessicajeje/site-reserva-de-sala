import React from 'react'
import { Input, Menu } from "semantic-ui-react";

const FiltroProfessor = ({ setBuscaNome}) => {
  return (

       <Menu secondary style={{ marginBottom: '20px' }}>
      <Menu.Item>
        <Input 
          icon="search" 
          placeholder="Filtrar tipo..." 
          onChange={(e) => setBuscaNome(e.target.value)} 
        />
      </Menu.Item>
    </Menu>

  )
}

export default FiltroProfessor
