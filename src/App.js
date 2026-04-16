
import './App.css';
import Rotas from './Rotas';
import DisciplinasCadastradas from './views/administrador/DisciplinasCadastradas';
import SalasCadastradas from './views/administrador/SalasCadastradas';
import TurmasCadastradas from './views/administrador/TurmasCadastradas';
import ValidarProfessor from './views/administrador/ValidarProfessor';


function App() {
  return (
    <div className="App">
    <ValidarProfessor/>
    </div>
  );
}

export default App;
