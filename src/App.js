import 'react-toastify/dist/ReactToastify.css';
import { setupAxiosInterceptors } from './views/util/AuthenticationService.js';
import { ToastContainer } from 'react-toastify';
import Rotas from './Rotas';

setupAxiosInterceptors();

function App() {
  return (
    <div className="App">
      <Rotas />
      <ToastContainer />
    </div>
  );
}

export default App;
