import { Route, Routes } from "react-router-dom";
import TurmasCadastradas from "./views/administrador/TurmasCadastradas";
import CadastroDisciplina from "./views/cadastros/CadastroDisciplina";
import CadastroProfessor from "./views/cadastros/CadastroProfessor";
import CadastroSala from "./views/cadastros/CadastroSala";
import CadastroTurma from "./views/cadastros/CadastroTurma";
import LoginADM from "./views/logins/LoginADM";
import LoginProfessor from "./views/logins/LoginProfessor";
import DisciplinasCadastradas from "./views/administrador/DisciplinasCadastradas";

function Rotas() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginProfessor />} />
        <Route path="login-adm" element={ <LoginADM/> } />
        <Route path="cadastro-professor" element={ <CadastroProfessor/> } />
        <Route path="cadastro-sala" element={ <CadastroSala/> } />
        <Route path="cadastro-turma" element={<CadastroTurma />} />
        <Route path="cadastro-disciplina" element={<CadastroDisciplina />} />

        <Route path="turmas" element={<TurmasCadastradas />} />
        <Route path="disciplinas" element={<DisciplinasCadastradas />} />
      </Routes>
    </>
  );
}

export default Rotas;