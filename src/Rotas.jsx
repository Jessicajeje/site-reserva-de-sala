import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from './views/util/ProtectedRoute';

import LayoutADM from "./layouts/LayoutADM";
import LayoutProfessor from "./layouts/LayoutProfessor";
import Cursos from "./views/administrador/Cursos";
import DisciplinasCadastradas from "./views/administrador/DisciplinasCadastradas";
import GradeAlocacaoAula from "./views/administrador/GradeAlocacaoAula";
import ListAlocacaoAula from "./views/administrador/ListAlocacaoAula";
import ProfessoresAtivos from "./views/administrador/ProfessoresAtivos";
import SalasCadastradas from "./views/administrador/SalasCadastradas";
import TurmasCadastradas from "./views/administrador/TurmasCadastradas";
import ValidarProfessor from "./views/administrador/ValidarProfessor";
import CadastroAlocacaoAula from "./views/cadastros/CadastroAlocacaoAula";
import CadastroCurso from "./views/cadastros/CadastroCurso";
import CadastroDisciplina from "./views/cadastros/CadastroDisciplina";
import CadastroProfessor from "./views/cadastros/CadastroProfessor";
import CadastroSala from "./views/cadastros/CadastroSala";
import CadastroTurma from "./views/cadastros/CadastroTurma";
import LoginADM from "./views/logins/LoginADM";
import LoginProfessor from "./views/logins/LoginProfessor";
import Home from "./views/professor/Home";
import Notificacoes from "./views/professor/Notificacoes";
import Perfil from "./views/professor/Perfil";
import Reposicao from "./views/professor/Reposicao.jsx";

function Rotas() {
  return (
    <Routes>
      {/* ROTAS PÚBLICAS (Sem Navbar) */}
      <Route path="/" element={<LoginProfessor />} />
      <Route path="login-adm" element={<LoginADM />} />
      <Route path="cadastro-professor" element={<CadastroProfessor />} />

      {/* ROTAS DO ADM (Com Navbar de ADM) */}
      <Route element={<LayoutADM />}>
        <Route path="cadastro-sala" element={<ProtectedRoute><CadastroSala /></ProtectedRoute>} />
        <Route path="cadastro-curso" element={<ProtectedRoute><CadastroCurso /></ProtectedRoute>} />
        <Route path="cursos" element={<ProtectedRoute><Cursos /></ProtectedRoute>} />
        <Route path="cadastro-turma" element={<ProtectedRoute><CadastroTurma /></ProtectedRoute>} />
        <Route path="cadastro-disciplina" element={<ProtectedRoute><CadastroDisciplina /></ProtectedRoute>} />
        <Route path="cadastro-alocacao-aula" element={<ProtectedRoute><CadastroAlocacaoAula /></ProtectedRoute>} />

        <Route path="turmas" element={<ProtectedRoute><TurmasCadastradas /></ProtectedRoute>} />
        <Route path="disciplinas" element={<ProtectedRoute><DisciplinasCadastradas /></ProtectedRoute>} />
        <Route path="salas" element={<ProtectedRoute><SalasCadastradas /></ProtectedRoute>} />
        <Route path="validar-prof" element={<ProtectedRoute><ValidarProfessor /></ProtectedRoute>} />
        <Route path="professores-ativos" element={<ProtectedRoute><ProfessoresAtivos /></ProtectedRoute>} />
        <Route path="/alocacoes-aulas" element={<ProtectedRoute><ListAlocacaoAula /></ProtectedRoute>} />
        <Route path="/grade-alocacao-aula" element={<ProtectedRoute><GradeAlocacaoAula /></ProtectedRoute>} />
      </Route>

      {/* ROTAS DO PROFESSOR (Com Navbar de Professor) */}
      <Route element={<LayoutProfessor />}>
        <Route path="home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="notificacoes" element={<ProtectedRoute><Notificacoes/></ProtectedRoute>} />
        <Route path="reposicao" element={<ProtectedRoute><Reposicao /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default Rotas;
