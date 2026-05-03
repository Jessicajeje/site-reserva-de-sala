import { Route, Routes } from "react-router-dom";
import LayoutADM from "./layouts/LayoutADM";
import LayoutProfessor from "./layouts/LayoutProfessor";
import DisciplinasCadastradas from "./views/administrador/DisciplinasCadastradas";
import SalasCadastradas from "./views/administrador/SalasCadastradas";
import TurmasCadastradas from "./views/administrador/TurmasCadastradas";
import ValidarProfessor from "./views/administrador/ValidarProfessor";
import CadastroDisciplina from "./views/cadastros/CadastroDisciplina";
import CadastroProfessor from "./views/cadastros/CadastroProfessor";
import CadastroSala from "./views/cadastros/CadastroSala";
import CadastroTurma from "./views/cadastros/CadastroTurma";
import LoginADM from "./views/logins/LoginADM";
import LoginProfessor from "./views/logins/LoginProfessor";
import ProfessoresAtivos from "./views/administrador/ProfessoresAtivos";
import Home from "./views/home/Home";
import Perfil from "./views/perfil/Perfil";

function Rotas() {
  return (
      <Routes>
  {/* ROTAS PÚBLICAS (Sem Navbar) */}
  <Route path="/" element={<LoginProfessor />} />
  <Route path="login-adm" element={<LoginADM />} />

  {/* ROTAS DO ADM (Com Navbar de ADM) */}
  <Route element={<LayoutADM />}> 
    <Route path="cadastro-professor" element={<CadastroProfessor />} />
    <Route path="cadastro-sala" element={<CadastroSala />} />
    <Route path="cadastro-turma" element={<CadastroTurma />} />
    <Route path="cadastro-disciplina" element={<CadastroDisciplina />} />
    
    <Route path="turmas" element={<TurmasCadastradas />} />
    <Route path="disciplinas" element={<DisciplinasCadastradas />} />
    <Route path="salas" element={<SalasCadastradas />} />
    <Route path="validar-prof" element={<ValidarProfessor />} />
    <Route path="professores-ativos" element={<ProfessoresAtivos />} />
  </Route>

  {/* ROTAS DO PROFESSOR (Com Navbar de Professor) */}
  <Route element={<LayoutProfessor />}>
    {/* Coloque aqui as rotas que o professor acessa após logar */}
    
  </Route>
    </Routes>
  );
}

export default Rotas;