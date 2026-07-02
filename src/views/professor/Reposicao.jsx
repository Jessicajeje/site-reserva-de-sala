import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  Header,
  Icon,
  Segment,
  Select,
  Table,
  Modal
} from "semantic-ui-react";
import { notifyError, notifySuccess } from "../../views/util/Util";

/* --- FUNÇÕES UTILITÁRIAS --- */
const eHoje = (data) => {
  const hoje = new Date();
  return (
    data.getDate() === hoje.getDate() &&
    data.getMonth() === hoje.getMonth() &&
    data.getFullYear() === hoje.getFullYear()
  );
};

const formatarDia = (data) => {
  const nome = data
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "");
  const dataMes = data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  return { nome: nome.charAt(0).toUpperCase() + nome.slice(1), data: dataMes };
};

const getSemanasDoMes = () => {
  const agora = new Date();
  let dataCursor = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const diaSemana = dataCursor.getDay();
  const diff = dataCursor.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
  dataCursor.setDate(diff);

  return Array.from({ length: 5 }).map((_, i) => {
    const inicio = new Date(dataCursor);
    const fim = new Date(dataCursor);
    fim.setDate(dataCursor.getDate() + 5);
    const item = {
      key: i,
      text: `Semana ${i + 1}`,
      value: inicio.getTime(),
    };
    dataCursor.setDate(dataCursor.getDate() + 7);
    return item;
  });
};

const gerarDiasDaSemana = (timestampSegunda) => {
  return Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(timestampSegunda);
    d.setDate(d.getDate() + i);
    return d;
  });
};

// FIX 1 — Removido "12:45" (slot inexistente)
const horariosTurno = {
  Manhã: [
    "07:15",
    "08:00",
    "08:45",
    "09:45",
    "10:30",
    "11:15",
    "12:00",
  ],
  Tarde: ["13:45", "14:30", "15:15", "16:00", "16:45"],
  Noite: ["18:15", "19:00", "19:45", "20:30", "21:15"],
};

const obterDiaSemana = (data) => {
  const dias = [
    "DOMINGO",
    "SEGUNDA",
    "TERCA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SABADO",
  ];
  return dias[data.getDay()];
};

// FIX 2 — Sempre soma 45 min ao início para obter o fim real.
// Antes, pegava o próximo slot do array: 08:45 → 09:45 (errado);
// agora: 08:45 + 45 min = 09:30 (correto).
const getProximoHorario = (hora) => {
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + 45;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

/* --- CALENDÁRIO ACADÊMICO --- */
const CALENDARIO_ACADEMICO = {
  "2026.1": { inicio: new Date(2026, 1, 3), fim: new Date(2026, 6, 3) },   // 03/02/2026 - 03/07/2026
  "2026.2": { inicio: new Date(2026, 7, 4), fim: new Date(2026, 11, 18) }, // 04/08/2026 - 18/12/2026
};

// Retorna "1" ou "2" (compatível com o campo semestreLetivo da alocação) ou null se fora de período letivo
const obterSemestreLetivo = (data) => {
  const dataZerada = new Date(data.getFullYear(), data.getMonth(), data.getDate());

  for (const chave of Object.keys(CALENDARIO_ACADEMICO)) {
    const { inicio, fim } = CALENDARIO_ACADEMICO[chave];
    if (dataZerada >= inicio && dataZerada <= fim) {
      return chave.split(".")[1];
    }
  }
  return null;
};

/* --- COMPONENTE PRINCIPAL --- */

export default function Reposicao() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const opcoesSemanas = getSemanasDoMes();

  const semanaAtualOuPrimeira =
    opcoesSemanas.find((s) => {
      const inicioSemana = new Date(s.value);
      const fimSemana = new Date(s.value);
      fimSemana.setDate(inicioSemana.getDate() + 7);
      const hoje = new Date();
      return hoje >= inicioSemana && hoje < fimSemana;
    })?.value || opcoesSemanas[0].value;

  // Estados
  const [semanaSelecionada, setSemanaSelecionada] = useState(semanaAtualOuPrimeira);
  const [preview, setPreview] = useState({ dia: null, horarioInicio: null, horarioFim: null });
  const [idReposicao, setIdReposicao] = useState(null);
  const [turnoAtivo, setTurnoAtivo] = useState("Manhã");
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [dataAulaOriginal, setDataAulaOriginal] = useState("");
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFim, setHorarioFim] = useState("");
  const [salas, setSalas] = useState([]);
  const [salaSelecionada, setSalaSelecionada] = useState("");
  const [idTurma, setIdTurma] = useState("");
  const [opcoesTurma, setOpcoesTurma] = useState([]);
  const [idDisciplina, setIdDisciplina] = useState("");
  const [opcoesDisciplina, setOpcoesDisciplina] = useState([]);
  const [idProfessor, setIdProfessor] = useState("");
  const diasExibidos = gerarDiasDaSemana(semanaSelecionada);
  const [alocacoes, setAlocacoes] = useState([]);
  const [reposicoes, setReposicoes] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [nomeProfessor, setNomeProfessor] = useState("");
  const [emailProfessor, setEmailProfessor] = useState("");

  // ─── FILTROS DE VISUALIZAÇÃO DA GRADE ────────────────────────────────────────
  const [turmaFiltro, setTurmaFiltro] = useState("");
  const [disciplinaFiltro, setDisciplinaFiltro] = useState("");
  const [salaFiltro, setSalaFiltro] = useState("");

  // ─── SEMESTRE LETIVO VIGENTE PARA A SEMANA EXIBIDA ───────────────────────────
  const semestreAtual = useMemo(
    () => obterSemestreLetivo(new Date(semanaSelecionada)),
    [semanaSelecionada]
  );

  // ─── ALOCAÇÕES E REPOSIÇÕES FILTRADAS PELO SEMESTRE VIGENTE ─────────────────
  const alocacoesDoSemestre = useMemo(
    () => alocacoes.filter((a) => a.semestreLetivo === semestreAtual),
    [alocacoes, semestreAtual]
  );

  const reposicoesDoSemestre = useMemo(() => {
    return reposicoes.filter((r) => {
      const alocacaoCorrespondente = alocacoes.find(
        (a) => a.turma?.id === r.turma?.id && a.disciplina?.id === r.disciplina?.id
      );
      return alocacaoCorrespondente?.semestreLetivo === semestreAtual;
    });
  }, [reposicoes, alocacoes, semestreAtual]);

  // ─── OPÇÕES DOS FILTROS (Turma / Disciplina / Sala) ──────────────────────────
  const alocacoesDoTurno = useMemo(
    () =>
      alocacoesDoSemestre.filter(
        (a) => a.turma?.turno?.toLowerCase() === turnoAtivo.toLowerCase()
      ),
    [alocacoesDoSemestre, turnoAtivo]
  );

  const opcoesTurmaFiltro = useMemo(
    () => [
      ...new Map(
        alocacoesDoTurno
          .filter((a) => a.turma)
          .map((a) => [
            a.turma.id,
            { key: a.turma.id, value: a.turma.id, text: a.turma.nome },
          ])
      ).values(),
    ],
    [alocacoesDoTurno]
  );

  const opcoesDisciplinaFiltro = useMemo(
    () => [
      ...new Map(
        alocacoesDoTurno
          .filter((a) => a.disciplina && (!turmaFiltro || a.turma?.id === turmaFiltro))
          .map((a) => [
            a.disciplina.id,
            { key: a.disciplina.id, value: a.disciplina.id, text: a.disciplina.nome },
          ])
      ).values(),
    ],
    [alocacoesDoTurno, turmaFiltro]
  );

  const opcoesSalaFiltro = useMemo(
    () => [
      ...new Map(
        salas.map((s) => [
          s.id,
          {
            key: s.id,
            value: s.id,
            text: s.nome || `${s.tipo === "laboratorio" ? "Laboratório" : "Sala"} ${s.numero}`,
          },
        ])
      ).values(),
    ],
    [salas]
  );

  const filtrosAtivos = !!(turmaFiltro || disciplinaFiltro || salaFiltro);

  const limparFiltros = () => {
    setTurmaFiltro("");
    setDisciplinaFiltro("");
    setSalaFiltro("");
  };

  // Verifica se um evento (aula ou reposição) atende aos filtros selecionados
  const atendeFiltros = (item) => {
    if (!item) return true;
    if (turmaFiltro && item.turma?.id !== turmaFiltro) return false;
    if (disciplinaFiltro && item.disciplina?.id !== disciplinaFiltro) return false;
    if (salaFiltro && item.sala?.id !== salaFiltro) return false;
    return true;
  };

  // ─── SALAS DISPONÍVEIS PARA O HORÁRIO SELECIONADO ────────────────────────────
  // Aqui consideramos TODOS os professores: uma sala ocupada por qualquer
  // professor não pode ser oferecida como disponível, independente de quem
  // está logado. Essa é a única checagem de conflito física que faz sentido
  // manter no front — o resto (turma/sala repetida na reposição em si) é
  // validado no back-end.
  const salasDisponiveis = useMemo(() => {
    if (!dataSelecionada || !horarioInicio || !horarioFim) return salas;

    const [ano, mes, dia] = dataSelecionada.split("-").map(Number);
    const diaObj = new Date(ano, mes - 1, dia);
    const diaSemana = obterDiaSemana(diaObj);

    const toMin = (t) => {
      const [h, m] = (t ?? "00:00").substring(0, 5).split(":").map(Number);
      return h * 60 + m;
    };

    const inicioMin = toMin(horarioInicio);
    const fimMin = toMin(horarioFim);
    const salasOcupadasIds = new Set();

    alocacoesDoSemestre.forEach((al) => {
      al.horarios?.forEach((h) => {
        if (h.diaSemana !== diaSemana) return;
        const alocInicio = toMin(h.horarioInicio);
        const alocFim = toMin(h.horarioFim);
        if (!(fimMin <= alocInicio || inicioMin >= alocFim)) {
          if (al.sala?.id) salasOcupadasIds.add(al.sala.id);
        }
      });
    });

    reposicoesDoSemestre.forEach((r) => {
      if (r.dataReposicao !== dataSelecionada) return;
      const repInicio = toMin(r.horarioInicio);
      const repFim = toMin(r.horarioFim);
      if (!(fimMin <= repInicio || inicioMin >= repFim)) {
        if (r.sala?.id) salasOcupadasIds.add(r.sala.id);
      }
    });

    return salas.filter((sala) => !salasOcupadasIds.has(sala.id));
  }, [dataSelecionada, horarioInicio, horarioFim, salas, alocacoesDoSemestre, reposicoesDoSemestre]);

  // ─── INICIALIZAÇÃO ────
  useEffect(() => {
    setIdProfessor(Number(localStorage.getItem("idProfessor")));
    setEmailProfessor(localStorage.getItem("username") || "");

    axios
      .get("http://localhost:8080/api/sala")
      .then((response) => setSalas(response.data))
      .catch((err) => {
        console.error("Erro ao buscar salas:", err);
        notifyError("Erro ao carregar salas. Verifique a conexão.");
      });

    axios
      .get("http://localhost:8080/api/alocacao-aula")
      .then((res) => setAlocacoes(res.data));

    axios
      .get("http://localhost:8080/api/reposicao")
      .then((res) => {
        const data = res.data;
        setReposicoes(Array.isArray(data) ? data : data.content || []);
      })
      .catch((err) => {
        console.error("Erro reposições:", err);
        setReposicoes([]);
      });

    const idProf = Number(localStorage.getItem("idProfessor"));
    setIdProfessor(idProf);

    axios
      .get(`http://localhost:8080/api/professor/${idProf}`)
      .then((res) => setNomeProfessor(res.data.nome))
      .catch((err) => console.error("Erro ao buscar professor:", err));

    if (state?.id) {
      axios
        .get(`http://localhost:8080/api/reposicao/${state.id}`)
        .then((res) => {
          setIdReposicao(res.data.id);
          setDataSelecionada(res.data.dataSelecionada || "");
          setDataAulaOriginal(res.data.dataAulaOriginal || "");
          setHorarioInicio(res.data.horarioInicio || "");
          setHorarioFim(res.data.horarioFim || "");
          setIdTurma(res.data.idTurma || "");
          setIdDisciplina(res.data.idDisciplina || "");
          setSalas(res.data.salas || []);
        });
    }
  }, [state]);

  useEffect(() => {
    if (!idProfessor) return;

    const turmasProfessor = [
      ...new Map(
        alocacoes
          .filter((a) => a.professor?.id === idProfessor && a.semestreLetivo === semestreAtual)
          .map((a) => [
            a.turma.id,
            {
              key: a.turma.id,
              value: a.turma.id,
              text: `${a.turma.nome} - ${a.turma.turno}`,
            },
          ])
      ).values(),
    ];

    setOpcoesTurma(turmasProfessor);

  }, [alocacoes, idProfessor, semestreAtual]);

  useEffect(() => {
    if (!idTurma) {
      setOpcoesDisciplina([]);
      setIdDisciplina("");
      return;
    }

    const disciplinas = alocacoesDoSemestre
      .filter(
        a =>
          a.turma?.id === idTurma &&
          a.professor?.id === idProfessor
      )
      .map(a => a.disciplina)
      .filter(
        (disciplina, index, self) =>
          disciplina &&
          index === self.findIndex(d => d.id === disciplina.id)
      );

    setOpcoesDisciplina(
      disciplinas.map((d) => ({
        key: d.id,
        text: d.nome,
        value: d.id,
      }))
    );
  }, [idTurma, idProfessor, alocacoesDoSemestre]);

  // Ao trocar de turno, os filtros de turma/disciplina podem não existir mais
  useEffect(() => {
    setTurmaFiltro("");
    setDisciplinaFiltro("");
  }, [turnoAtivo]);

  // ─── SELEÇÃO DE HORÁRIO NO CALENDÁRIO ───
  const selecionarHorario = (dia, hora) => {
    const diaStr = dia.toString();

    if (preview.dia === diaStr && preview.horarioInicio === hora) {
      setPreview({ dia: null, horarioInicio: null, horarioFim: null });
      setDataSelecionada("");
      setHorarioInicio("");
      setHorarioFim("");
      return;
    }

    if (preview.dia !== diaStr || !preview.horarioInicio) {
      const dataLocal = new Date(
        dia.getTime() - dia.getTimezoneOffset() * 60000,
      );
      setDataSelecionada(dataLocal.toISOString().split("T")[0]);
      setPreview({ dia: diaStr, horarioInicio: hora, horarioFim: hora });
      setHorarioInicio(hora);
      setHorarioFim(getProximoHorario(hora));
      return;
    }

    if (hora > preview.horarioInicio) {
      const horasDoTurno = horariosTurno[turnoAtivo];
      const idxStart = horasDoTurno.indexOf(preview.horarioInicio);
      const idxClicked = horasDoTurno.indexOf(hora);

      if (idxStart === -1 || idxClicked === -1) {
        setPreview({ dia: diaStr, horarioInicio: hora, horarioFim: hora });
        setHorarioInicio(hora);
        setHorarioFim(getProximoHorario(hora));
        return;
      }

      // Ao esticar a seleção, só a alocação/reposição PRÓPRIA do
      // professor logado deve interromper o intervalo. Aulas/reposições
      // de outros professores não impedem a seleção (a regra de sala
      // duplicada é validada no back-end).
      let fimSeguro = preview.horarioInicio;
      for (let i = idxStart + 1; i <= idxClicked; i++) {
        const h = horasDoTurno[i];
        const bloqueiaAqui = !!existeAlocacaoPropria(dia, h) || !!existeReposicaoPropria(dia, h);
        if (bloqueiaAqui) break;
        fimSeguro = h;
      }

      setPreview({ ...preview, horarioFim: fimSeguro });
      setHorarioFim(getProximoHorario(fimSeguro));
    } else {
      setPreview({ dia: diaStr, horarioInicio: hora, horarioFim: hora });
      setHorarioInicio(hora);
      setHorarioFim(getProximoHorario(hora));
    }
  };

  const formatarData = (data) => {
    if (!data) return "";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const salvarAgendamento = () => {
    const formatarParaBR = (dataISO) => {
      if (!dataISO) return "";
      const [ano, mes, dia] = dataISO.split("-");
      return `${dia}/${mes}/${ano}`;
    };
    if (!validarAntesDeSalvar()) return;
    const payload = {
      idTurma,
      idDisciplina,
      idSala: salaSelecionada?.id,
      idProfessor,
      dataReposicao: formatarParaBR(dataSelecionada),
      dataAulaOriginal: formatarParaBR(dataAulaOriginal),
      horarioInicio,
      horarioFim,
      statusReposicao: "PENDENTE",
    };
    const acao = idReposicao
      ? axios.put(`http://localhost:8080/api/reposicao/${idReposicao}`, payload)
      : axios.post("http://localhost:8080/api/reposicao", payload);

    acao
      .then(() => {
        notifySuccess("Agendado!");
        setTimeout(() => window.location.reload(), 1000);
      })
      .catch((err) => notifyError(err.response?.data?.message));
  };

  // Só bloqueia com base nas alocações do PRÓPRIO professor logado —
  // ele não pode dar duas aulas/reposições ao mesmo tempo. Conflitos de
  // sala ou turma com outros professores são responsabilidade do back-end.
  const conflitoNoIntervalo = (dia, inicioHora, fimHora) => {
    const diaSemana = obterDiaSemana(dia);

    const conflitaComAlocacaoPropria = alocacoesDoSemestre
      .filter((a) => a.professor?.id === idProfessor)
      .some((alocacao) =>
        alocacao.horarios?.some((h) => {
          if (h.diaSemana !== diaSemana) return false;
          const inicio = h.horarioInicio.substring(0, 5);
          const fim = h.horarioFim.substring(0, 5);
          return !(fimHora <= inicio || inicioHora >= fim);
        })
      );

    if (conflitaComAlocacaoPropria) return true;

    const dataISO = [
      dia.getFullYear(),
      String(dia.getMonth() + 1).padStart(2, "0"),
      String(dia.getDate()).padStart(2, "0"),
    ].join("-");

    return reposicoesDoSemestre
      .filter((r) => r.professor?.id === idProfessor && r.id !== idReposicao)
      .some((r) => {
        if (r.dataReposicao !== dataISO) return false;
        const inicio = (r.horarioInicio ?? "").substring(0, 5);
        const fim = (r.horarioFim ?? "").substring(0, 5);
        return !(fimHora <= inicio || inicioHora >= fim);
      });
  };

  // ─── EVENTOS (ALOCAÇÕES E REPOSIÇÕES) NO SLOT ────────────────────────────────
  // Retorna TODOS os itens que ocupam um dado dia/hora, não apenas o primeiro
  // encontrado — é isso que permite decidir corretamente qual exibir quando
  // duas turmas/professores diferentes usam salas diferentes no mesmo horário.
  const alocacoesNoSlot = (dia, hora) => {
    const diaSemana = obterDiaSemana(dia);

    return alocacoesDoSemestre.filter((alocacao) =>
      alocacao.horarios?.some((h) => {
        if (h.diaSemana !== diaSemana) return false;
        const inicio = h.horarioInicio.substring(0, 5);
        const fim = h.horarioFim.substring(0, 5);
        return hora >= inicio && hora < fim;
      })
    );
  };

  const reposicoesNoSlot = (dia, hora) => {
    const dataISO = [
      dia.getFullYear(),
      String(dia.getMonth() + 1).padStart(2, "0"),
      String(dia.getDate()).padStart(2, "0"),
    ].join("-");

    const toMin = (t) => {
      const [h, m] = (t ?? "00:00").substring(0, 5).split(":").map(Number);
      return h * 60 + m;
    };

    const horaMin = toMin(hora);

    return reposicoesDoSemestre.filter((r) => {
      if (r.dataReposicao !== dataISO) return false;
      const inicioMin = toMin(r.horarioInicio);
      const fimMin = toMin(r.horarioFim);
      return horaMin >= inicioMin && horaMin < fimMin;
    });
  };

  // Usadas apenas para saber se O PRÓPRIO professor logado já tem algo
  // marcado naquele slot (ex.: travar o "esticar" da seleção e bloquear o
  // clique na grade). Eventos de outros professores nunca bloqueiam nada.
  const existeAlocacaoPropria = (dia, hora) =>
    alocacoesNoSlot(dia, hora).find((a) => a.professor?.id === idProfessor) ?? null;

  const existeReposicaoPropria = (dia, hora) =>
    reposicoesNoSlot(dia, hora).find((r) => r.professor?.id === idProfessor) ?? null;

  // FIX 5 — Decide QUAL evento aparece dentro de uma célula da grade, já que
  // pode haver mais de uma alocação/reposição no mesmo dia/horário (turmas,
  // salas e professores diferentes não são "conflito", são bookings normais
  // em espaços distintos). Substitui o antigo indicador de "⚠ CONFLITO".
  // Prioridade:
  //   1) Se algum filtro (turma/disciplina/sala) está ativo, mostra o
  //      evento que atende ao filtro — é assim que se localiza um horário
  //      específico dentro de um slot concorrido. Isso só decide QUAL
  //      evento aparece; o destaque visual (esmaecido ou não) continua
  //      sendo definido só pela posse do evento, não pelo filtro.
  //   2) Sem filtro, prioriza sempre o que é do PRÓPRIO professor logado
  //      (reposição própria > aula própria), pois é o mais relevante para
  //      ele e é o único que deve bloquear a seleção de um novo horário.
  //   3) Se não há nada do próprio professor, mostra o primeiro evento de
  //      outro professor, esmaecido — um clique ali sobrescreve o horário.
  const obterEventoDaCelula = (dia, hora) => {
    const alocacoes = alocacoesNoSlot(dia, hora);
    const reposicoes = reposicoesNoSlot(dia, hora);

    const eventos = [
      ...alocacoes.map((dados) => ({ tipo: "ALOCAÇÃO", dados })),
      ...reposicoes.map((dados) => ({ tipo: "REPOSIÇÃO", dados })),
    ];

    if (eventos.length === 0) return null;

    if (filtrosAtivos) {
      const doFiltro = eventos.find((e) => atendeFiltros(e.dados));
      if (doFiltro) {
        return { ...doFiltro, propria: doFiltro.dados.professor?.id === idProfessor };
      }
    }

    const reposicaoPropria = eventos.find(
      (e) => e.tipo === "REPOSIÇÃO" && e.dados.professor?.id === idProfessor
    );
    if (reposicaoPropria) return { ...reposicaoPropria, propria: true };

    const aulaPropria = eventos.find(
      (e) => e.tipo === "ALOCAÇÃO" && e.dados.professor?.id === idProfessor
    );
    if (aulaPropria) return { ...aulaPropria, propria: true };

    return { ...eventos[0], propria: false };
  };

  const validarAntesDeSalvar = () => {
    const [ano, mes, dia] = dataSelecionada.split("-").map(Number);
    const diaObj = new Date(ano, mes - 1, dia);
    if (conflitoNoIntervalo(diaObj, horarioInicio, horarioFim)) {
      notifyError("Você já tem uma aula ou reposição nesse horário.");
      return false;
    }
    return true;
  };

  const abrirDetalhes = (tipo, dados) => {
    setEventoSelecionado({ tipo, dados });
    setModalAberto(true);
  };

  return (
    <div style={{ padding: "2% 4%", fontFamily: "sans-serif" }}>
      <Header as="h2" dividing>
        <Icon name="calendar alternate outline" /> Reposição de Aulas
      </Header>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "40px",
          alignItems: "flex-start",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* PAINEL ESQUERDO: Calendário + Salas */}
        <div
          style={{
            flex: "1",
            minWidth: "0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Button
            icon
            labelPosition="left"
            color="grey"
            size="small"
            onClick={() => navigate("/home")}
            style={{ marginBottom: "1rem", alignSelf: "flex-start" }}
          >
            <Icon name="arrow left" />
            Voltar
          </Button>
          {/* Topo do calendário */}
          <div
            style={{
              marginBottom: "1.5em",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Select
                compact
                options={opcoesSemanas}
                value={semanaSelecionada}
                onChange={(e, { value }) => setSemanaSelecionada(value)}
              />
              {semestreAtual && (
                <span style={{ fontSize: "12px", color: "grey" }}>
                  Semestre letivo: <b>{semestreAtual}º</b>
                </span>
              )}
            </div>
            <Button.Group size="small">
              {Object.keys(horariosTurno).map((t) => (
                <Button
                  key={t}
                  active={turnoAtivo === t}
                  color={turnoAtivo === t ? "green" : null}
                  onClick={() => setTurnoAtivo(t)}
                >
                  {t}
                </Button>
              ))}
            </Button.Group>
          </div>

          {/* FILTROS DA GRADE — layout em flexbox para não quebrar em telas menores */}
          <Segment
            secondary
            style={{
              marginBottom: "1.2em",
              borderRadius: "10px",
              padding: "14px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "38px",
                }}
              >
                <Icon name="filter" color="green" size="large" style={{ margin: 0 }} />
              </div>

              <div style={{ flex: "1 1 160px", minWidth: "160px" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "grey", marginBottom: "4px" }}>
                  TURMA
                </div>
                <Select
                  fluid
                  clearable
                  search
                  selection
                  placeholder="Todas"
                  options={opcoesTurmaFiltro}
                  value={turmaFiltro}
                  onChange={(e, { value }) => {
                    setTurmaFiltro(value);
                    setDisciplinaFiltro("");
                  }}
                />
              </div>

              <div style={{ flex: "1 1 160px", minWidth: "160px" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "grey", marginBottom: "4px" }}>
                  DISCIPLINA
                </div>
                <Select
                  fluid
                  clearable
                  search
                  selection
                  placeholder="Todas"
                  options={opcoesDisciplinaFiltro}
                  value={disciplinaFiltro}
                  onChange={(e, { value }) => setDisciplinaFiltro(value)}
                />
              </div>

              <div style={{ flex: "1 1 160px", minWidth: "160px" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "grey", marginBottom: "4px" }}>
                  SALA
                </div>
                <Select
                  fluid
                  clearable
                  search
                  selection
                  placeholder="Todas"
                  options={opcoesSalaFiltro}
                  value={salaFiltro}
                  onChange={(e, { value }) => setSalaFiltro(value)}
                />
              </div>

              <div style={{ flex: "0 0 auto" }}>
                <Button
                  basic
                  color="grey"
                  size="small"
                  disabled={!filtrosAtivos}
                  onClick={limparFiltros}
                >
                  <Icon name="close" />
                  Limpar
                </Button>
              </div>
            </div>
          </Segment>

          <div style={{ width: "100%", overflowX: "auto", position: "relative" }}>
            {!semestreAtual && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "rgba(255, 255, 255, 0.85)",
                  backdropFilter: "blur(1px)",
                  borderRadius: "8px",
                  minWidth: "700px",
                }}
              >
                <Icon name="sun" size="huge" color="orange" />
                <Header as="h2" style={{ margin: 0, color: "#b5651d" }}>
                  Período de Férias
                </Header>
                <span style={{ color: "grey", fontSize: "13px" }}>
                  Não há período letivo vigente para a semana selecionada.
                </span>
              </div>
            )}
            <Table
              celled
              definition
              textAlign="center"
              color="green"
              style={{
                minWidth: "700px",
                margin: 0,
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                opacity: semestreAtual ? 1 : 0.4,
                filter: semestreAtual ? "none" : "grayscale(0.6)",
                pointerEvents: semestreAtual ? "auto" : "none",
              }}
            >
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell style={{ width: "110px" }} />
                  {diasExibidos.map((dia) => {
                    const info = formatarDia(dia);
                    const hoje = eHoje(dia);
                    return (
                      <Table.HeaderCell
                        key={dia.toString()}
                        style={{
                          backgroundColor: hoje ? "#e8f0e3" : "#f9fafb",
                        }}
                      >
                        {info.nome} <br /> {info.data}
                      </Table.HeaderCell>
                    );
                  })}
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {horariosTurno[turnoAtivo].map((hora) => (
                  <Table.Row key={hora}>
                    {/* FIX 3 — Exibe "início – fim" na coluna esquerda */}
                    <Table.Cell collapsing style={{ whiteSpace: "nowrap" }}>
                      <b style={{ fontSize: "11px" }}>
                        {hora} – {getProximoHorario(hora)}
                      </b>
                    </Table.Cell>
                    {diasExibidos.map((dia) => {
                      const evento = obterEventoDaCelula(dia, hora);
                      const concluida =
                        evento?.tipo === "REPOSIÇÃO" &&
                        evento.dados.statusReposicao === "CONCLUIDA";
                      const diaStr = dia.toString();
                      const hoje = eHoje(dia);

                      // Só bloqueia (e abre os detalhes ao clicar) quando o
                      // evento exibido na célula é do PRÓPRIO professor
                      // logado. Eventos de outros professores aparecem
                      // esmaecidos e um clique ali inicia uma nova seleção,
                      // sobrescrevendo o horário — a validação de sala/turma
                      // duplicada é feita no back-end.
                      const bloqueado = !!evento?.propria;
                      // O esmaecimento depende SEMPRE da posse do evento,
                      // nunca do filtro — o filtro só decide qual evento
                      // aparece na célula (útil pra localizar um horário
                      // específico), mas eventos de outros professores
                      // continuam visualmente secundários mesmo quando
                      // batem com o filtro selecionado.
                      const eventoOfuscado = evento && !evento.propria;

                      const isSelected =
                        !bloqueado &&
                        preview.dia === diaStr &&
                        hora >= preview.horarioInicio &&
                        hora <= preview.horarioFim;

                      const isStart = isSelected && hora === preview.horarioInicio;
                      const isEnd = isSelected && hora === preview.horarioFim;

                      return (
                        <Table.Cell
                          key={dia.toString()}
                          selectable={!bloqueado && !!semestreAtual}
                          onClick={() => {
                            if (!semestreAtual) return;
                            if (bloqueado) {
                              abrirDetalhes(evento.tipo, evento.dados);
                              return;
                            }
                            selecionarHorario(dia, hora);
                          }}
                          style={{
                            height: "60px",
                            position: "relative",
                            cursor: "pointer",
                            backgroundColor: isSelected
                              ? "#e2efda"
                              : hoje
                                ? "#f8faf8"
                                : "transparent",
                            borderRadius: isStart
                              ? "8px 8px 0 0"
                              : isEnd
                                ? "0 0 8px 8px"
                                : "0",
                            zIndex: isSelected ? 1 : 0,
                          }}
                        >
                          {evento?.tipo === "ALOCAÇÃO" ? (
                            <div
                              style={{
                                position: "absolute",
                                inset: "2px",
                                background: "#eff4ff",
                                borderLeft: "3px solid #1e5eff",
                                borderRadius: "4px",
                                padding: "3px 6px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                gap: "2px",
                                overflow: "hidden",
                                opacity: eventoOfuscado ? 0.35 : 1,
                                filter: eventoOfuscado ? "grayscale(0.6)" : "none",
                                transition: "opacity 0.15s ease",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "9px",
                                  fontWeight: "bold",
                                  color: "#000000",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {evento.dados.professor?.nome}
                              </span>
                              <span
                                style={{
                                  fontSize: "9px",
                                  color: "#333",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {evento.dados.turma?.nome} · {evento.dados.disciplina?.nome}
                              </span>
                              <span
                                style={{
                                  fontSize: "9px",
                                  color: "#888",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {evento.dados.sala?.nome ??
                                  `${evento.dados.sala?.tipo === "laboratorio" ? "Laboratório" : "Sala"} ${evento.dados.sala?.numero ?? ""}`}
                              </span>
                            </div>
                          ) : evento?.tipo === "REPOSIÇÃO" ? (
                            <div
                              style={{
                                position: "absolute",
                                inset: "2px",
                                background: concluida ? "#e6f9ed" : "#fff8ef",
                                borderLeft: concluida
                                  ? "3px solid #21ba45"
                                  : "3px solid #f97316",
                                borderRadius: "4px",
                                padding: "3px 6px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                gap: "2px",
                                overflow: "hidden",
                                opacity: eventoOfuscado ? 0.35 : 1,
                                filter: eventoOfuscado ? "grayscale(0.6)" : "none",
                                transition: "opacity 0.15s ease",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "9px",
                                  fontWeight: "bold",
                                  color: "rgb(0, 0, 0)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {evento.dados.professor?.nome}
                              </span>
                              <span
                                style={{
                                  fontSize: "9px",
                                  color: "#333",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {evento.dados.turma?.nome} · {evento.dados.disciplina?.nome}
                              </span>
                              <span
                                style={{
                                  fontSize: "9px",
                                  color: "#888",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {evento.dados.sala?.tipo} {evento.dados.sala?.numero}
                              </span>
                            </div>
                          ) : null}

                          {isStart && (
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: isEnd ? 0 : -10,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                zIndex: 2,
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <b>{nomeProfessor}</b>
                              <Icon name="user circle" style={{ margin: "1px 0" }} />
                              <span>
                                {horarioInicio} - {horarioFim}
                              </span>
                            </div>
                          )}
                        </Table.Cell>
                      );
                    })}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          <Segment
            secondary
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "18px",
              alignItems: "center",
              marginBottom: "1rem",
              padding: "12px 16px",
              borderRadius: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  background: "#eff4ff",
                  borderLeft: "4px solid #1e5eff",
                  borderRadius: 4,
                }}
              />
              <span>Alocação de Aula (sua)</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  background: "#fff8ef",
                  borderLeft: "4px solid #f97316",
                  borderRadius: 4,
                }}
              />
              <span>Reposição Pendente (sua)</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  background: "#e6f9ed",
                  borderLeft: "4px solid #21ba45",
                  borderRadius: 4,
                }}
              />
              <span>Reposição Concluída (sua)</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  background: "#e2efda",
                  borderRadius: 4,
                }}
              />
              <span>Horário Selecionado</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  background: "#e0e0e0",
                  borderRadius: 4,
                  opacity: 0.5,
                }}
              />
              <span>De outro professor — clique para sobrescrever</span>
            </div>
          </Segment>

          {/* SALAS DISPONÍVEIS */}
          <div style={{ marginTop: "1em" }}>
            <Header as="h3" style={{ marginBottom: "1em" }}>
              <Icon name="building outline" />
              {dataSelecionada && horarioInicio
                ? `Salas Disponíveis — ${formatarData(dataSelecionada)} · ${horarioInicio}–${horarioFim}`
                : "Salas Disponíveis"}
            </Header>

            {salasDisponiveis.length === 0 ? (
              <Segment textAlign="center" secondary style={{ color: "grey", borderRadius: "10px" }}>
                {dataSelecionada && horarioInicio
                  ? "Nenhuma sala disponível para o horário selecionado."
                  : "Selecione um horário no calendário para ver as salas disponíveis."}
              </Segment>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: "16px",
                  width: "100%",
                }}
              >
                {salasDisponiveis.map((sala) => (
                  <Segment
                    key={sala.id}
                    raised
                    onClick={() => setSalaSelecionada(sala)}
                    style={{
                      margin: 0,
                      borderRadius: "10px",
                      cursor: "pointer",
                      transition: "border 0.15s ease, background-color 0.15s ease",
                      border:
                        salaSelecionada?.id === sala.id
                          ? "3px solid #21ba45"
                          : "1px solid #ddd",
                      backgroundColor:
                        salaSelecionada?.id === sala.id ? "#f0fff4" : "white",
                    }}
                  >
                    <Header as="h4" color="green" style={{ margin: 0 }}>
                      {sala.nome || `${sala.tipo === "laboratorio" ? "Laboratório" : "Sala"} ${sala.numero}`}
                    </Header>
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "dimgrey",
                      }}
                    >
                      <p>
                        <b>Bloco:</b> {sala.bloco || "N/A"}
                      </p>
                    </div>
                  </Segment>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PAINEL DIREITO: Formulário */}
        <div style={{ width: "320px", marginTop: "3.3em" }}>
          <Segment
            raised
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: "10px",
              borderTop: "4px solid #21ba45",
            }}
          >
            <Header as="h3" textAlign="center" style={{ marginBottom: "1em" }}>
              Agendar Reposição
            </Header>
            <Form>
              <Form.Input
                label="Dia:"
                type="date"
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
              />

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "1em",
                  width: "100%",
                }}
              >
                <div style={{ flex: 1 }}>
                  <Form.Input label="Início" value={horarioInicio} readOnly fluid />
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Input label="Fim" value={horarioFim} readOnly fluid />
                </div>
              </div>

              <Form.Input
                label="Sala"
                value={
                  salaSelecionada
                    ? `${salaSelecionada.tipo}  ${salaSelecionada.numero}`
                    : ""
                }
                readOnly
                fluid
              />

              <Form.Input
                fluid
                type="date"
                label="Data Aula Original"
                value={dataAulaOriginal}
                onChange={(e) => setDataAulaOriginal(e.target.value)}
              />

              <Form.Select
                label="Turma"
                placeholder="Selecione"
                options={opcoesTurma}
                value={idTurma}
                onChange={(e, { value }) => {
                  setIdTurma(value);
                  setIdDisciplina("");
                }}
              />

              <Form.Select
                label="Disciplina"
                placeholder={idTurma ? "Selecione" : "Selecione uma turma primeiro"}
                options={opcoesDisciplina}
                value={idDisciplina}
                disabled={!idTurma}
                onChange={(e, { value }) => setIdDisciplina(value)}
              />

              <Form.Input label="Professor" value={nomeProfessor} readOnly fluid />

              <Button
                fluid
                size="large"
                color="green"
                onClick={salvarAgendamento}
                style={{ marginTop: "1.2em" }}
              >
                {idReposicao ? "Salvar Alteração" : "Confirmar Reposição"}
              </Button>
            </Form>
          </Segment>
        </div>
      </div>

      {/* MODAL DE DETALHES */}
      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        size="small"
      >
        <Modal.Header>{eventoSelecionado?.tipo}</Modal.Header>

        <Modal.Content>
          {eventoSelecionado && (
            <div style={{ lineHeight: "2" }}>
              <p>
                <b>Professor:</b> {eventoSelecionado.dados.professor?.nome}
              </p>
              <p>
                <b>Turma:</b> {eventoSelecionado.dados.turma?.nome}
              </p>
              <p>
                <b>Disciplina:</b> {eventoSelecionado.dados.disciplina?.nome}
              </p>
              <p>
                <b>{eventoSelecionado.dados.sala?.nome ??
                  `${eventoSelecionado.dados.sala?.tipo === "laboratorio" ? "Laboratório" : "Sala"}`}:</b>{" "}
                {eventoSelecionado.dados.sala?.nome ||
                  eventoSelecionado.dados.sala?.numero}
              </p>

              {eventoSelecionado.tipo === "ALOCAÇÃO" && (
                <>
                  <p>
                    <b>Curso:</b> {eventoSelecionado.dados.turma?.curso?.nome}
                  </p>
                  <p>
                    <b>Horários:</b>
                  </p>
                  <ul>
                    {eventoSelecionado.dados.horarios?.map((h, i) => (
                      <li key={i}>
                        {h.diaSemana} - {h.horarioInicio} às {h.horarioFim}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {eventoSelecionado.tipo === "REPOSIÇÃO" && (
                <>
                  <p>
                    <b>Data da Reposição:</b>{" "}
                    {eventoSelecionado.dados.dataReposicao}
                  </p>
                  <p>
                    <b>Data Aula Original:</b>{" "}
                    {eventoSelecionado.dados.dataAulaOriginal}
                  </p>
                  <p>
                    <b>Horário:</b>{" "}
                    {eventoSelecionado.dados.horarioInicio} às{" "}
                    {eventoSelecionado.dados.horarioFim}
                  </p>
                  <p>
                    <b>Status:</b> {eventoSelecionado.dados.statusReposicao}
                  </p>
                </>
              )}
            </div>
          )}
        </Modal.Content>

        <Modal.Actions>
          <Button onClick={() => setModalAberto(false)}>Fechar</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
}