import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { ToastContainer } from 'react-toastify';
import Rotas from './Rotas';


function App() {
  return (
    <div className="App">
    <Rotas/>
    <ToastContainer /> 
    </div>
  );
}

export default App;
