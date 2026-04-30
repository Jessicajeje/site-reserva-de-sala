import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Form, Grid, Header, Icon, Segment } from "semantic-ui-react";
import { notifyError, notifySuccess, notifyWarn } from "../../views/util/Util";
import "../logins/estilo.css";

//sistema de horários de 45 em 45 minutos
const gerarOpcoesHorarios = () => {
  const horarios = [];
  let data = new Date();
  data.setHours(7, 0, 0, 0); // Inicia às 07:00
  while (
    data.getHours() < 22 ||
    (data.getHours() === 22 && data.getMinutes() === 0)
  ) {
    const horarioFormatado = data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    horarios.push({
      key: horarioFormatado,
      text: horarioFormatado,
      value: horarioFormatado,
    });

    data.setMinutes(data.getMinutes() + 45); // Pula 45 minutos
  }
  return horarios;
};

const opcoesHorarios = gerarOpcoesHorarios();

const CadastroDisciplina = () => {
  const { state } = useLocation();
  const [idDisciplina, setIdDisciplina] = useState();
  const [nome, setNome] = useState("");
  const [horarios, setHorarios] = useState([
    { dia: "", horaInicio: "", horaFim: "" },
  ]);
  const [areaSelecionada, setAreaSelecionada] = useState("");
  const [turno, setTurno] = useState();
  const opcoesTurno = [
    { key: "manha", text: "Manhã", value: "manha" },
    { key: "tarde", text: "Tarde", value: "tarde" },
    { key: "noite", text: "Noite", value: "noite" },
  ];

  const opcoesArea = [
    { key: "adm", text: "Administração", value: "administracao" },
    { key: "qual", text: "Gestão da Qualidade", value: "gestao_qualidade" },
    {
      key: "tech",
      text: "Tecnologia da Informação",
      value: "tecnologia_informacao",
    },
    {
      key: "proc",
      text: "Processos Gerenciais",
      value: "processos_gerenciais",
    },
   { key: "log", text: "Logística", value: "logistica" },
  ];
  const opcoesDias = [
    { key: "seg", text: "Segunda-feira", value: "SEGUNDA" },
    { key: "ter", text: "Terça-feira", value: "TERCA" },
    { key: "qua", text: "Quarta-feira", value: "QUARTA" },
    { key: "qui", text: "Quinta-feira", value: "QUINTA" },
    { key: "sex", text: "Sexta-feira", value: "SEXTA" },
    { key: "sab", text: "Sábado", value: "SABADO" },
  ];

useEffect(() => {
  if (state != null && state.id != null) {
    axios
      .get("http://localhost:8080/api/disciplina/" + state.id)
      .then((response) => {
        setIdDisciplina(response.data.id);
        setTurno(response.data.turno);
        setNome(response.data.nome);
        setAreaSelecionada(response.data.area);
        setHorarios(response.data.horarios || []); 
      });
  }
}, [state]);

  const adicionarHorario = () => {
    setHorarios([...horarios, { dia: "", inicio: "", fim: "" }]);
  };

  const removerHorario = (index) => {
    const novosHorarios = horarios.filter((_, i) => i !== index);
    setHorarios(novosHorarios);
  };

  function salvar() {
    // 1. VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS
    const algumHorarioIncompleto = horarios.some(
      (h) => !h.dia || !h.horaInicio || !h.horaFim,
    );

    if (!nome || !areaSelecionada || !turno || algumHorarioIncompleto) {
      notifyWarn("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // 2. VALIDAÇÃO DE LÓGICA DE HORÁRIOS (Início vs Fim)
    if (horarios.some((h) => h.horaInicio >= h.horaFim)) {
      notifyError("Horário de início deve ser anterior ao horário de fim.");
      return;
    }

    // 3. VALIDAÇÃO DE DUPLICADOS
    const temDuplicado = horarios.some(
      (h, index) =>
        horarios.findIndex(
          (h2) =>
            h2.dia === h.dia &&
            h2.horaInicio === h.horaInicio &&
            h2.horaFim === h.horaFim,
        ) !== index,
    );

    if (temDuplicado) {
      notifyError("Existem blocos de horários duplicados.");
      return;
    }

    // 4. VALIDAÇÃO DE TURNOS
    const validarTurnos = () => {
      return horarios.some((h) => {
        const hInicio = parseInt(h.horaInicio.split(":")[0]);
        const hFim = parseInt(h.horaFim.split(":")[0]);

        if (turno === "manha") return hInicio < 7 || hFim > 12;
        if (turno === "tarde") return hInicio < 13 || hFim > 18;
        if (turno === "noite") return hInicio < 18 || hFim > 22;
        return false;
      });
    };

    if (validarTurnos()) {
      const mensagens = {
        manha: "07:00 - 12:00",
        tarde: "13:00 - 18:00",
        noite: "18:00 - 22:00",
      };
      notifyError(
        `Horários incompatíveis com o turno ${turno} (${mensagens[turno]}).`,
      );
      return;
    }

    const disciplinaRequest = {
      area: areaSelecionada,
      nome: nome,
      turno: turno,
      horarios: horarios,
    };

    if (idDisciplina != null) {
      // ALTERAÇÃO
      axios
        .put(
          `http://localhost:8080/api/disciplina/${idDisciplina}`,
          disciplinaRequest,
        )
        .then(() => notifySuccess("Disciplina alterada com sucesso."))
        .catch(() => notifyError("Erro ao alterar a disciplina."));
    } else {
      // CADASTRO NOVO
      axios
        .post("http://localhost:8080/api/disciplina", disciplinaRequest)
        .then(() => notifySuccess("Disciplina cadastrada com sucesso."))
        .catch(() => notifyError("Erro ao incluir a disciplina."));
    }
  }

  return (
    <Grid
      textAlign="center"
      style={{ height: "100vh", backgroundColor: "#f4f4f4" }}
      verticalAlign="middle"
    >
      <Grid.Column style={{ maxWidth: 500 }}>
        <Segment raised style={{ padding: "3em" }}>
          <Header
            as="h1"
            textAlign="center"
            style={{ marginBottom: "1.5em", fontSize: "2em" }}
          >
            {idDisciplina === undefined && (
              <h2>
                {" "}
                <span style={{ color: "darkgray" }}>
                  {" "}
                  Cadastro &nbsp;
                  <Icon name="angle double right" size="small" />{" "}
                </span>{" "}
                Disciplina
              </h2>
            )}
            {idDisciplina !== undefined && (
              <h2>
                {" "}
                <span style={{ color: "darkgray" }}>
                  {" "}
                  Alteração &nbsp;
                  <Icon name="angle double right" size="small" />{" "}
                </span>{" "}
                Disciplina
              </h2>
            )}
          </Header>

          <Form size="large" style={{ textAlign: "left" }}>
            <Form.Field style={{ marginBottom: "1.5em" }}>
              <label style={{ fontSize: "16px", marginBottom: "10px" }}>
                Área da disciplina:*
              </label>
              <Form.Select
                fluid
                required
                placeholder="Selecione a área"
                options={opcoesArea}
                value={areaSelecionada}
                onChange={(e, { value }) => setAreaSelecionada(value)}
              />
            </Form.Field>
            <Form.Input
              fluid
              required
              label="Nome da disciplina:*"
              placeholder="Ex: Algoritmos II"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={{ marginBottom: "1.5em" }}
            />

            <Form.Field style={{ marginBottom: "1.5em" }}>
              <label style={{ fontSize: "16px", marginBottom: "10px" }}>
                Turno:*
              </label>
              <Form.Select
                fluid
                required
                placeholder="Selecione a área"
                options={opcoesTurno}
                value={turno}
                onChange={(e, { value }) => setTurno(value)}
              />
            </Form.Field>

            {horarios.map((bloco, index) => (
              <Segment key={index} secondary style={{ marginBottom: "1em" }}>
                {/* Dia ocupando a linha toda */}
                <Form.Field>
                  <label>Dia da Semana:*</label>
                  <Form.Select
                    fluid
                    placeholder="Selecione o dia"
                    options={opcoesDias}
                    value={bloco.dia}
                    onChange={(e, { value }) => {
                      const novos = [...horarios];
                      novos[index].dia = value;
                      setHorarios(novos);
                    }}
                  />
                </Form.Field>

                <Form.Group widths="equal" style={{ alignItems: "flex-end" }}>
                  <Form.Select
                    fluid
                    label="Início"
                    options={opcoesHorarios}
                    value={bloco.horaInicio}
                    onChange={(e, { value }) => {
                      const novos = [...horarios];
                      novos[index].horaInicio = value;
                      setHorarios(novos);
                    }}
                  />
                  <Form.Select
                    fluid
                    label="Fim"
                    options={opcoesHorarios}
                    value={bloco.horaFim}
                    onChange={(e, { value }) => {
                      const novos = [...horarios];
                      novos[index].horaFim = value;
                      setHorarios(novos);
                    }}
                  />
                  <Button
                    icon
                    type="button"
                    color="red"
                    onClick={() => removerHorario(index)}
                    style={{ height: "38px", marginBottom: "4px" }}
                  >
                    <Icon name="trash" />
                  </Button>
                </Form.Group>
              </Segment>
            ))}

            <Button
              type="button"
              fluid
              icon
              labelPosition="left"
              onClick={adicionarHorario}
              disabled={horarios.length >= 2} // TRAVA AQUI
              style={{ marginBottom: "1.5em" }}
            >
              <Icon name="add" />
              {horarios.length >= 2
                ? "Limite de 2 horários atingido"
                : "Adicionar Horário"}
            </Button>
            <Button
              fluid
              size="huge"
              type="button"
              style={{
                backgroundColor: "#21ba45",
                color: "#fff",
                marginTop: "20px",
              }}
              onClick={salvar}
            >
              Concluir
            </Button>
          </Form>
        </Segment>
      </Grid.Column>
    </Grid>
  );
};

export default CadastroDisciplina;
