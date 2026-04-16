
import './App.css';
import Rotas from './Rotas';
import DisciplinasCadastradas from './views/administrador/DisciplinasCadastradas';
import TurmasCadastradas from './views/administrador/TurmasCadastradas';


function App() {
  return (
    <div className="App">
    <Rotas/>
    <TurmasCadastradas/>
    </div>
  );
}

export default App;
