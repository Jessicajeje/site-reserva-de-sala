import React from 'react'
import { Input, Menu } from "semantic-ui-react";

const FiltroSala = ({ setBuscaTipo}) => {
  return (

       <Menu secondary style={{ marginBottom: '20px' }}>
      <Menu.Item>
        <Input 
          icon="search" 
          placeholder="Filtrar tipo..." 
          onChange={(e) => setBuscaTipo(e.target.value)} 
        />
      </Menu.Item>
    </Menu>

  )
}

export default FiltroSala
