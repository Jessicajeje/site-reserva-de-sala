import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Button,
  Form,
  Grid,
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
    horaInicio: null,
    horaFim: null,
  });
  const [idReposicao, setIdReposicao] = useState(null);
  const [lista, setLista] = useState([]);
  const [turnoAtivo, setTurnoAtivo] = useState("Manhã");
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [salas, setSalas] = useState([]);
  const [salaSelecionada, setSalaSelecionada] = useState("");
  const [turma, setTurma] = useState("");
  const [opcoesTurma, setOpcoesTurma] = useState([]);

  const diasExibidos = gerarDiasDaSemana(semanaSelecionada);

  // REQUISIÇÕES E INICIALIZAÇÃO

  useEffect(() => {
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
      .get("http://localhost:8080/api/salas")
      .then((response) => {
        setSalas(response.data);
      })
      .catch((err) => {
        console.error("Erro ao buscar salas:", err);
        notifyError("Erro ao carregar salas. Verifique a conexão.");
      });

    if (state?.id) {
      axios
        .get(`http://localhost:8080/api/reposicao/${state.id}`)
        .then((res) => {
          setIdReposicao(res.data.id);
          setDataSelecionada(res.data.dataSelecionada || "");
          setHoraInicio(res.data.horaInicio || "");
          setHoraFim(res.data.horaFim || "");
          setTurma(res.data.turma || "");
          setSalas(res.data.salas || "");
        });
    }
  }, [state]);

  const selecionarHorario = (dia, hora) => {
    const diaStr = dia.toString();

    //Desmarcar: se clicar exatamente no início que já existe
    if (preview.dia === diaStr && preview.horaInicio === hora) {
      setPreview({ dia: null, horaInicio: null, horaFim: null });
      setDataSelecionada("");
      setHoraInicio("");
      setHoraFim("");
      return;
    }

    //Novo: se mudar de dia ou não houver nada selecionado
    if (preview.dia !== diaStr || !preview.horaInicio) {
      const dataLocal = new Date(
        dia.getTime() - dia.getTimezoneOffset() * 60000,
      );
      setDataSelecionada(dataLocal.toISOString().split("T")[0]);
      setPreview({ dia: diaStr, horaInicio: hora, horaFim: hora });
      setHoraInicio(hora);
      setHoraFim(hora);
    }
    //Esticar: se for no mesmo dia
    else {
      if (hora > preview.horaInicio) {
        setPreview({ ...preview, horaFim: hora });
        setHoraFim(hora);
      } else {
        setPreview({ dia: diaStr, horaInicio: hora, horaFim: hora });
        setHoraInicio(hora);
        setHoraFim(hora);
      }
    }
  };

  const salvarAgendamento = () => {
    const payload = { dataSelecionada, horaInicio, horaFim, turma };
    const acao = idReposicao
      ? axios.put(`http://localhost:8080/api/reposicao/${idReposicao}`, payload)
      : axios.post("http://localhost:8080/api/reposicao", payload);

    acao
      .then(() => {
        notifySuccess("Agendado!");
        setTimeout(() => window.location.reload(), 1000);
      })
      .catch((err) =>
        notifyError(err.response?.data?.message || "Erro ao salvar."),
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
                        hora >= preview.horaInicio &&
                        hora <= preview.horaFim;

                      const isStart = isSelected && hora === preview.horaInicio;
                      const isEnd = isSelected && hora === preview.horaFim;
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
                              <b>Professor</b>
                              <Icon
                                name="user circle"
                                style={{ margin: "1px 0" }}
                              />
                              <span>
                                {horaInicio} - {horaFim}
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
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "16px",
              width: "100%"
            }}>
              {salas.map((salas) => (
                <Segment key={salas.id} raised style={{ margin: 0, borderRadius: "8px" }}    onClick={() => setSalaSelecionada(salas.nome)}>
                  <Header as="h4" color="green" style={{ margin: 0 }}>
                    {salas.nome || `Sala ${salas.numero}`}
                  </Header>
                  <div style={{ marginTop: "8px", fontSize: "12px", color: "dimgrey" }}>
                    <p style={{ margin: "2px 0" }}><b>Bloco:</b> {salas.bloco || "N/A"}</p>
                    <p style={{ margin: "2px 0" }}><b>Capacidade:</b> {salas.capacidade || "0"} Alunos</p>
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
                    value={horaInicio}
                    readOnly
                    fluid
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Input label="Fim" value={horaFim} readOnly fluid />
                </div>
              </div>
              <Form.Input 
              label="Sala" 
              value={salaSelecionada} 
              readOnly fluid
               />
              <Form.Select
                label="Turma"
                placeholder="Selecione"
                options={opcoesTurma}
                value={turma}
                onChange={(e, { value }) => setTurma(value)}
              />

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
    </div>
  );
}
