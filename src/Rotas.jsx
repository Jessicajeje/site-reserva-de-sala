import { Route, Routes } from "react-router-dom";
import CadastroDisciplina from "./views/cadastros/CadastroDisciplina";
import CadastroTurma from "./views/cadastros/CadastroTurma";
import CadastroSala from "./views/cadastros/CadastroSala";
import CadastroProfessor from "./views/cadastros/CadastroProfessor";
import LoginProfessor from "./views/logins/LoginProfessor";
import LoginADM from "./views/logins/LoginADM";

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
      </Routes>
    </>
  );
}

export default Rotas;