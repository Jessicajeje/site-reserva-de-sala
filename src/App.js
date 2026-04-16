
import './App.css';
import Rotas from './Rotas';
import DisciplinasCadastradas from './views/administrador/DisciplinasCadastradas';
import SalasCadastradas from './views/administrador/SalasCadastradas';
import TurmasCadastradas from './views/administrador/TurmasCadastradas';
import ValidarProfessor from './views/administrador/ValidarProfessor';
import CadastroDisciplina from './views/cadastros/CadastroDisciplina';
import CadastroProfessor from './views/cadastros/CadastroProfessor';
import CadastroSala from './views/cadastros/CadastroSala';
import CadastroTurma from './views/cadastros/CadastroTurma';


function App() {
  return (
    <div className="App">
    <CadastroDisciplina/>

    </div>
  );
}

export default App;
