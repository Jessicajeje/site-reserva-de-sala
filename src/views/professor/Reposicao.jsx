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

const horariosTurno = {
  Manhã: [
    "07:15",
    "08:00",
    "08:45",
    "09:45",
    "10:30",
    "11:15",
    "12:00",
    "12:45",
  ],
  Tarde: ["13:45", "14:30", "15:15", "16:00", "16:45", "17:30"],
  Noite: ["18:30", "19:15", "20:00", "20:45", "21:30", "22:15"],
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

const getProximoHorario = (hora, turno) => {
  const horasDoTurno = horariosTurno[turno];
  const idx = horasDoTurno.indexOf(hora);
  if (idx === -1 || idx >= horasDoTurno.length - 1) {
    // Último slot: soma 45 min
    const [h, m] = hora.split(":").map(Number);
    const total = h * 60 + m + 45;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  }
  return horasDoTurno[idx + 1];
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
  const [NomeProfessor, setNomeProfessor] = useState("");
  const diasExibidos = gerarDiasDaSemana(semanaSelecionada);
  const [alocacoes, setAlocacoes] = useState([]);
  const [reposicoes, setReposicoes] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [nomeProfessor, setNomeProfessor] = useState("");

  // ─── SALAS DISPONÍVEIS PARA O HORÁRIO SELECIONADO ────────────────────────────
  // Filtra salas que já têm alocação fixa (por diaSemana) ou reposição
  // agendada no mesmo dia e horário escolhido. Recalcula sempre que o
  // horário ou a base de dados mudar.
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

    // Alocações fixas (verificadas pelo dia da semana)
    alocacoes.forEach((al) => {
      al.horarios?.forEach((h) => {
        if (h.diaSemana !== diaSemana) return;
        const alocInicio = toMin(h.horarioInicio);
        const alocFim = toMin(h.horarioFim);
        if (!(fimMin <= alocInicio || inicioMin >= alocFim)) {
          if (al.sala?.id) salasOcupadasIds.add(al.sala.id);
        }
      });
    });

    // Reposições (verificadas pela data específica)
    reposicoes.forEach((r) => {
      if (r.dataReposicao !== dataSelecionada) return;
      const repInicio = toMin(r.horarioInicio);
      const repFim = toMin(r.horarioFim);
      if (!(fimMin <= repInicio || inicioMin >= repFim)) {
        if (r.sala?.id) salasOcupadasIds.add(r.sala.id);
      }
    });

    return salas.filter((sala) => !salasOcupadasIds.has(sala.id));
  }, [dataSelecionada, horarioInicio, horarioFim, salas, alocacoes, reposicoes]);

  // ─── INICIALIZAÇÃO ────
  useEffect(() => {
    setIdProfessor(Number(localStorage.getItem("idProfessor")));
    setEmailProfessor(localStorage.getItem("username") || "");

    axios
      .get("http://localhost:8080/api/turma")
      .then((response) => {
        setOpcoesTurma(
          response.data.map((t) => ({ key: t.id, text: t.nome, value: t.id })),
        );
      })
      .catch((err) => {
        console.error("Erro ao buscar turmas:", err);
        notifyError("Erro ao carregar turmas. Verifique a conexão.");
      });

      if(idSalvo){
        setIdProfessor(idSalvo)

        axios.get(`http://localhost:8080/api/professor/${idSalvo}`)
      .then((response) => {
        setNomeProfessor(response.data.nome);
      })
      .catch((err) => {
        console.error("Erro ao buscar nome do professor:", err);
        notifyError("Erro ao carregar nome do professor. Verifique a conexão.");
      });
  }
      

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
  }, [idProfessor, state]);

  useEffect(() => {
    if (!idTurma) {
      setOpcoesDisciplina([]);
      setIdDisciplina("");
      return;
    }

    const disciplinas = alocacoes
      .filter((a) => a.turma?.id === idTurma)
      .map((a) => a.disciplina)
      .filter(
        (disciplina, index, self) =>
          disciplina &&
          index === self.findIndex((d) => d.id === disciplina.id)
      );

    setOpcoesDisciplina(
      disciplinas.map((d) => ({
        key: d.id,
        text: d.nome,
        value: d.id,
      }))
    );
  }, [idTurma, alocacoes]);

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
      setHorarioFim(getProximoHorario(hora, turnoAtivo));
      return;
    }

    if (hora > preview.horarioInicio) {
      const horasDoTurno = horariosTurno[turnoAtivo];
      const idxStart = horasDoTurno.indexOf(preview.horarioInicio);
      const idxClicked = horasDoTurno.indexOf(hora);

      if (idxStart === -1 || idxClicked === -1) {
        setPreview({ dia: diaStr, horarioInicio: hora, horarioFim: hora });
        setHorarioInicio(hora);
        setHorarioFim(getProximoHorario(hora, turnoAtivo));
        return;
      }

      let fimSeguro = preview.horarioInicio;
      for (let i = idxStart + 1; i <= idxClicked; i++) {
        const h = horasDoTurno[i];
        if (existeAlocacao(dia, h) || existeReposicao(dia, h)) break;
        fimSeguro = h;
      }

      setPreview({ ...preview, horarioFim: fimSeguro });
      setHorarioFim(getProximoHorario(fimSeguro, turnoAtivo));
    } else {
      setPreview({ dia: diaStr, horarioInicio: hora, horarioFim: hora });
      setHorarioInicio(hora);
      setHorarioFim(getProximoHorario(hora, turnoAtivo));
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

  const conflitoNoIntervalo = (dia, inicioHora, fimHora) => {
    const diaSemana = obterDiaSemana(dia);
    return alocacoes.some((alocacao) =>
      alocacao.horarios?.some((h) => {
        if (h.diaSemana !== diaSemana) return false;
        const inicio = h.horarioInicio.substring(0, 5);
        const fim = h.horarioFim.substring(0, 5);
        return !(fimHora < inicio || inicioHora > fim);
      })
    );
  };

  const existeAlocacao = (dia, hora) => {
    const diaSemana = obterDiaSemana(dia);
    return alocacoes.find((alocacao) =>
      alocacao.horarios?.some((h) => {
        if (h.diaSemana !== diaSemana) return false;
        const inicio = h.horarioInicio.substring(0, 5);
        const fim = h.horarioFim.substring(0, 5);
        return hora >= inicio && hora <= fim;
      })
    );
  };

  const existeReposicao = (dia, hora) => {
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

    return (
      reposicoes.find((r) => {
        if (r.dataReposicao !== dataISO) return false;
        const inicioMin = toMin(r.horarioInicio);
        const fimMin = toMin(r.horarioFim);
        return horaMin >= inicioMin && horaMin <= fimMin;
      }) ?? null
    );
  };

  const validarAntesDeSalvar = () => {
    const [ano, mes, dia] = dataSelecionada.split("-").map(Number);
    const diaObj = new Date(ano, mes - 1, dia);
    if (conflitoNoIntervalo(diaObj, horarioInicio, horarioFim)) {
      notifyError("Conflito com alocação existente.");
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
            onClick={() => navigate("/home")}
            style={{ marginBottom: "1rem" }}
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
            }}
          >
            <Select
              compact
              options={opcoesSemanas}
              value={semanaSelecionada}
              onChange={(e, { value }) => setSemanaSelecionada(value)}
            />
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

          <div style={{ width: "100%", overflowX: "auto" }}>
            <Table
              celled
              definition
              textAlign="center"
              color="green"
              style={{ minWidth: "700px", margin: 0 }}
            >
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell style={{ width: "80px" }} />
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
                    <Table.Cell collapsing>
                      <b>{hora}</b>
                    </Table.Cell>
                    {diasExibidos.map((dia) => {
                      const aula = existeAlocacao(dia, hora);
                      const reposicao = existeReposicao(dia, hora);
                      const concluida = reposicao?.statusReposicao === "CONCLUIDA";
                      const diaStr = dia.toString();
                      const hoje = eHoje(dia);

                      const isSelected =
                        !aula &&
                        !reposicao &&
                        preview.dia === diaStr &&
                        hora >= preview.horarioInicio &&
                        hora <= preview.horarioFim;

                      const isStart = isSelected && hora === preview.horarioInicio;
                      const isEnd = isSelected && hora === preview.horarioFim;

                      return (
                        <Table.Cell
                          key={dia.toString()}
                          selectable={!aula && !reposicao}
                          onClick={() => {
                            if (aula) {
                              abrirDetalhes("ALOCAÇÃO", aula);
                              return;
                            }
                            if (reposicao) {
                              abrirDetalhes("REPOSIÇÃO", reposicao);
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
                          {aula && reposicao ? (
                            <div
                              style={{
                                position: "absolute",
                                inset: "2px",
                                background: "#fcd0d0",
                                borderLeft: "3px solid #ff0000",
                                borderRadius: "4px",
                                padding: "3px 6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "9px",
                                fontWeight: "bold",
                                color: "#ff0000",
                              }}
                            >
                              ⚠ CONFLITO
                            </div>
                          ) : aula ? (
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
                                {aula.professor?.nome}
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
                                {aula.turma?.nome} · {aula.disciplina?.nome}
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
                                Sala {aula.sala?.nome ?? aula.sala?.numero}
                              </span>
                            </div>
                          ) : reposicao ? (
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
                                {reposicao.professor?.nome}
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
                                {reposicao.turma?.nome} · {reposicao.disciplina?.nome}
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
                                {reposicao.sala?.tipo} {reposicao.sala?.numero}
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
                              {/* Mostra o intervalo real: início até próximo slot */}
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
              <span>Alocação de Aula</span>
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
              <span>Reposição Pendente</span>
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
              <span>Reposição Concluída</span>
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
                  background: "#fcd0d0",
                  borderLeft: "4px solid #ff0000",
                  borderRadius: 4,
                }}
              />
              <span>Conflito</span>
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
              <Segment textAlign="center" secondary style={{ color: "grey" }}>
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
                      borderRadius: "8px",
                      cursor: "pointer",
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
                      {/* campo "Capacidade" removido conforme solicitado */}
                    </div>
                  </Segment>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PAINEL DIREITO: Formulário */}
        <div style={{ width: "320px", marginTop: "3.3em" }}>
          <Segment raised style={{ width: "100%", boxSizing: "border-box" }}>
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
                  setIdDisciplina(""); // reseta disciplina ao trocar turma
                }}
              />

              {/* Disciplina só aparece (e é habilitada) após selecionar turma */}
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
                <b>Sala:</b>{" "}
                {eventoSelecionado.dados.sala?.nome ||
                  eventoSelecionado.dados.sala?.numero}
              </p>

              {eventoSelecionado.tipo === "ALOCAÇÃO" && (
                <>
                  <p>
                    <b>ID:</b> {eventoSelecionado.dados.id}
                  </p>
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
                    <b>ID:</b> {eventoSelecionado.dados.id}
                  </p>
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
