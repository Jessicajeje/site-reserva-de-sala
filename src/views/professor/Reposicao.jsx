import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Button,
  Form,
  Header,
  Icon,
  Segment,
  Select,
  Table,
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

/* --- COMPONENTE PRINCIPAL --- */

export default function Reposicao() {
  const { state } = useLocation();
  const opcoesSemanas = getSemanasDoMes();

  const semanaAtualOuPrimeira =
    opcoesSemanas.find((s) => {
      const inicioSemana = new Date(s.value);
      const fimSemana = new Date(s.value);
      fimSemana.setDate(inicioSemana.getDate() + 7); // Janela de 7 dias
      const hoje = new Date();
      return hoje >= inicioSemana && hoje < fimSemana;
    })?.value || opcoesSemanas[0].value;

  // Estados
  const [semanaSelecionada, setSemanaSelecionada] = useState(
    semanaAtualOuPrimeira,
  );
  const [preview, setPreview] = useState({
    dia: null,
    horarioInicio: null,
    horarioFim: null,
  });
  const [idReposicao, setIdReposicao] = useState(null);
  const [lista, setLista] = useState([]);
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
  const [emailProfessor, setEmailProfessor] = useState("");
  const diasExibidos = gerarDiasDaSemana(semanaSelecionada);

  // REQUISIÇÕES E INICIALIZAÇÃO

  useEffect(() => {
    setIdProfessor(Number(localStorage.getItem("idProfessor")));
    setEmailProfessor(localStorage.getItem("username") || "");
    axios
      .get("http://localhost:8080/api/turma")
      .then((response) => {
        setLista(response.data);
        setOpcoesTurma(
          response.data.map((t) => ({ key: t.id, text: t.nome, value: t.id })),
        );
      })
      .catch((err) => {
        console.error("Erro ao buscar turmas:", err);
        notifyError("Erro ao carregar turmas. Verifique a conexão.");
      });

    axios
      .get("http://localhost:8080/api/sala")
      .then((response) => {
        setSalas(response.data);
      })
      .catch((err) => {
        console.error("Erro ao buscar salas:", err);
        notifyError("Erro ao carregar salas. Verifique a conexão.");
      });

    axios
      .get("http://localhost:8080/api/disciplina")
      .then((response) => {
        setOpcoesDisciplina(
          response.data.map((t) => ({ key: t.id, text: t.nome, value: t.id })),
        );
      })
      .catch((err) => {
        console.error("Erro ao buscar disciplinas:", err);
        notifyError("Erro ao carregar disciplinas. Verifique a conexão.");
      });

    if (state?.id) {
      axios
        .get(`http://localhost:8080/api/reposicao/${state.id}`)
        .then((res) => {
          setIdReposicao(res.data.id);
          setDataSelecionada(res.data.dataSelecionada || "");
          setDataAulaOriginal(res.data.dataAulaOriginal || "");
          setHorarioInicio(res.data.horarioInicio || "");
          setHorarioFim(res.data.horarioFim || "");
          setIdDisciplina(res.data.idDisciplina || "");
          setIdTurma(res.data.idTurma || "");
          setSalas(res.data.salas || []);
        });
    }
  }, [state]);

  const selecionarHorario = (dia, hora) => {
    const diaStr = dia.toString();

    //Desmarcar: se clicar exatamente no início que já existe
    if (preview.dia === diaStr && preview.horarioInicio === hora) {
      setPreview({ dia: null, horarioInicio: null, horarioFim: null });
      setDataSelecionada("");
      setHorarioInicio("");
      setHorarioFim("");
      return;
    }

    //Novo: se mudar de dia ou não houver nada selecionado
    if (preview.dia !== diaStr || !preview.horarioInicio) {
      const dataLocal = new Date(
        dia.getTime() - dia.getTimezoneOffset() * 60000,
      );
      setDataSelecionada(dataLocal.toISOString().split("T")[0]);
      setPreview({ dia: diaStr, horarioInicio: hora, horarioFim: hora });
      setHorarioInicio(hora);
      setHorarioFim(hora);
    }
    //Esticar: se for no mesmo dia
    else {
      if (hora > preview.horarioInicio) {
        setPreview({ ...preview, horarioFim: hora });
        setHorarioFim(hora);
      } else {
        setPreview({ dia: diaStr, horarioInicio: hora, horarioFim: hora });
        setHorarioInicio(hora);
        setHorarioFim(hora);
      }
    }
  };

  const formatarData = (data) => {
    if (!data) return "";

    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const salvarAgendamento = () => {
    const payload = {
      idTurma,
      idDisciplina,
      idSala: salaSelecionada?.id,
      idProfessor,
      dataReposicao: formatarData(dataSelecionada),
      dataAulaOriginal: formatarData(dataAulaOriginal),
      horarioInicio,
      horarioFim,
      statusReposicao: "PENDENTE"
    };
    const acao = idReposicao
      ? axios.put(`http://localhost:8080/api/reposicao/${idReposicao}`, payload)
      : axios.post("http://localhost:8080/api/reposicao", payload);

    acao
      .then(() => {
        notifySuccess("Agendado!");
        setTimeout(() => window.location.reload(), 1000);
      })
      .catch((err) =>
        notifyError(err.response?.data?.message),
      );
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
        {/* PAINEL ESQUERDO: Calendário e Seletores */}
        <div
          style={{
            flex: "1",
            minWidth: "0",
            display: "flex",
            flexDirection: "column",
          }}
        >
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

          <div
            style={{
              width: "100%",
              overflowX: "auto",
            }}
          >
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
                      const diaStr = dia.toString();
                      const hoje = eHoje(dia);

                      const isSelected =
                        preview.dia === diaStr &&
                        hora >= preview.horarioInicio &&
                        hora <= preview.horarioFim;

                      const isStart = isSelected && hora === preview.horarioInicio;
                      const isEnd = isSelected && hora === preview.horarioFim;
                      return (
                        <Table.Cell
                          key={dia.toString()}
                          selectable
                          onClick={() => selecionarHorario(dia, hora)}
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
                              <b>{emailProfessor}</b>
                              <Icon
                                name="user circle"
                                style={{ margin: "1px 0" }}
                              />
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

          {/* NOVA SEÇÃO: LISTAGEM DE SALAS ABAIXO DO CALENDÁRIO */}
          <div style={{ marginTop: "1em" }}>
            <Header as="h3" style={{ marginBottom: "1em" }}>
              <Icon name="building outline" /> Salas Disponíveis
            </Header>

            {salas.length === 0 ? (
              <Segment textAlign="center" secondary style={{ color: "grey" }}>
                Nenhuma salas encontrada ou carregando...
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
                {salas.map((sala) => (
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
                      {sala.nome || `Sala ${sala.numero}`}
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

                      <p>
                        <b>Capacidade:</b> {sala.capacidade || "0"} Alunos
                      </p>
                    </div>
                  </Segment>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            width: "320px",
            marginTop: "3.3em",
          }}
        >
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
                  <Form.Input
                    label="Início"
                    value={horarioInicio}
                    readOnly
                    fluid
                  />
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
                onChange={(e, { value }) => setIdTurma(value)}
              />
              <Form.Select
                label="Disciplina"
                placeholder="Selecione"
                options={opcoesDisciplina}
                value={idDisciplina}
                onChange={(e, { value }) => setIdDisciplina(value)}
              />
              <Form.Input
                label="Professor"
                value={emailProfessor}
                readOnly fluid />

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
    </div >
  );
}
