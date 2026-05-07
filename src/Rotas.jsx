import { Route, Routes } from "react-router-dom";
import DisciplinasCadastradas from "./views/administrador/DisciplinasCadastradas";
import SalasCadastradas from "./views/administrador/SalasCadastradas";
import TurmasCadastradas from "./views/administrador/TurmasCadastradas";
import CadastroDisciplina from "./views/cadastros/CadastroDisciplina";
import CadastroProfessor from "./views/cadastros/CadastroProfessor";
import CadastroSala from "./views/cadastros/CadastroSala";
import CadastroTurma from "./views/cadastros/CadastroTurma";
import LoginADM from "./views/logins/LoginADM";
import LoginProfessor from "./views/logins/LoginProfessor";

import Home from "./views/professor/Home";
import Notificacoes from "./views/professor/Notificacoes";
import Perfil from "./views/professor/Perfil";
//import Reposicao from "./views/professor/Reposicao";

function Rotas() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginProfessor/>} />

        <Route path="home" element={<Home/>} />
        <Route path="perfil" element={<Perfil/>} />
        <Route path="notificacoes" element={<Notificacoes/>} />

        <Route path="login-adm" element={ <LoginADM/> } />
        <Route path="cadastro-professor" element={ <CadastroProfessor/> } />
        <Route path="cadastro-sala" element={ <CadastroSala/> } />
        <Route path="cadastro-turma" element={<CadastroTurma />} />
        <Route path="cadastro-disciplina" element={<CadastroDisciplina />} />
        <Route path="turmas" element={<TurmasCadastradas />} />
        <Route path="disciplinas" element={<DisciplinasCadastradas />} />
        <Route path="salas" element={<SalasCadastradas />} />
      </Routes>
    </>
  );
}

export default Rotas;