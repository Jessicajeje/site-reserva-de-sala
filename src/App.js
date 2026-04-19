
import './App.css';

import Rotas from './Rotas'
import LayoutADM from './layouts/LayoutADM';
import DisciplinasCadastradas from './views/administrador/DisciplinasCadastradas';
import SalasCadastradas from './views/administrador/SalasCadastradas';
import TurmasCadastradas from './views/administrador/TurmasCadastradas';
import CadastroDisciplina from './views/cadastros/CadastroDisciplina';
import CadastroProfessor from './views/cadastros/CadastroProfessor';
import CadastroSala from './views/cadastros/CadastroSala';
import CadastroTurma from './views/cadastros/CadastroTurma';
import LoginADM from './views/logins/LoginADM';
import LoginProfessor from './views/logins/LoginProfessor';
import LayoutProfessor from './layouts/LayoutProfessor';
import ValidarProfessor from './views/administrador/ValidarProfessor';


function App() {
  return (
    <div className="App">
    <Rotas/>
    </div>
  );
}

export default App;
