import React from 'react'
import { Menu, Input } from 'semantic-ui-react'

const FiltroDisciplina = ({ setBuscaNome, setBuscaArea, setBuscaTurno }) => {
  return (
    
       <Menu secondary style={{ marginBottom: '20px' }}>
      <Menu.Item>
        <Input 
          icon="search" 
          placeholder="Filtrar nome..." 
          onChange={(e) => setBuscaNome(e.target.value)} 
        />
      </Menu.Item>
      <Menu.Item>
        <Input 
          icon="search" 
          placeholder="Filtrar área..." 
          onChange={(e) => setBuscaArea(e.target.value)} 
        />
      </Menu.Item>
      <Menu.Item>
        <Input 
          icon="search" 
          placeholder="Filtrar turno..." 
          onChange={(e) => setBuscaTurno(e.target.value)} 
        />
      </Menu.Item>
    </Menu>
  )
}

export default FiltroDisciplina
