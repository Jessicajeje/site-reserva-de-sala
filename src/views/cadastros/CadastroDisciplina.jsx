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

export default function CadastroDisciplina() {
  const { state } = useLocation();
  const [idDisciplina, setIdDisciplina] = useState();
  const [nome, setNome] = useState("");
  const [areaSelecionada, setAreaSelecionada] = useState("");
  const [turno, setTurno] = useState();
  const [horarios, setHorarios] = useState([
    { dia: "", horaInicio: "", horaFim: "" },
  ]);

  const opcoesTurno = [
    { key: "manha", text: "Manhã", value: "manha" },
    { key: "tarde", text: "Tarde", value: "tarde" },
    { key: "noite", text: "Noite", value: "noite" },
  ];

  const opcoesArea = [
    { key: "adm", text: "Administração", value: "administracao" },
    { key: "qual", text: "Gestão da Qualidade", value: "gestao_qualidade" },
    { key: "tech", text: "Tecnologia da Informação", value: "tecnologia_informacao" },
    { key: "proc", text: "Processos Gerenciais", value: "processos_gerenciais" },
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
//crud horarios
  const adicionarHorario = () => {
    setHorarios([...horarios, { dia: "", horaInicio: "", horaFim: "" }]);
  };

  const removerHorario = (index) => {
    const novosHorarios = horarios.filter((_, i) => i !== index);
    setHorarios(novosHorarios);
  };

  const atualizarHorario = (index, campo, valor) => {
    const novosHorarios = [...horarios];
    novosHorarios[index][campo] = valor;
    setHorarios(novosHorarios);
  };

  function salvar() {
    const algumHorarioIncompleto = horarios.some(
      (h) => !h.dia || !h.horaInicio || !h.horaFim
    );

    if (!nome || !areaSelecionada || !turno || algumHorarioIncompleto) {
      notifyWarn("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (horarios.some((h) => h.horaInicio >= h.horaFim)) {
      notifyError("Horário de início deve ser anterior ao horário de fim.");
      return;
    }

    const disciplinaRequest = {
      area: areaSelecionada,
      nome: nome,
      turno: turno,
      horarios: horarios,
    };

    if (idDisciplina != null) {
      axios
        .put(`http://localhost:8080/api/disciplina/${idDisciplina}`, disciplinaRequest)
        .then(() => notifySuccess("Disciplina alterada com sucesso."))
        .catch(() => notifyError("Erro ao alterar a disciplina."));
    } else {
      axios
        .post("http://localhost:8080/api/disciplina", disciplinaRequest)
        .then(() => notifySuccess("Disciplina cadastrada com sucesso."))
        .catch(() => notifyError("Erro ao incluir a disciplina."));
    }
  }

  return (
    <Grid textAlign="center" style={{ height: "100vh", backgroundColor: "#f4f4f4" }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 550 }}>
        <Segment raised style={{ padding: "3em" }}>
          <Header as="h1" textAlign="center" style={{ marginBottom: "1.5em" }}>
            {idDisciplina === undefined ? (
              <h2><span style={{ color: "darkgray" }}>Cadastro <Icon name="angle double right" size="small" /></span> Disciplina</h2>
            ) : (
              <h2><span style={{ color: "darkgray" }}>Alteração <Icon name="angle double right" size="small" /></span> Disciplina</h2>
            )}
          </Header>

          <Form size="large" style={{ textAlign: "left" }}>
            <Form.Field>
              <label>Área da disciplina:*</label>
              <Form.Select
                fluid
                placeholder="Selecione a área"
                options={opcoesArea}
                value={areaSelecionada}
                onChange={(e, { value }) => setAreaSelecionada(value)}
              />
            </Form.Field>

            <Form.Input
              fluid
              label="Nome da disciplina:*"
              placeholder="Ex: Algoritmos II"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <Form.Field>
              <label>Turno:*</label>
              <Form.Select
                fluid
                placeholder="Selecione o turno"
                options={opcoesTurno}
                value={turno}
                onChange={(e, { value }) => setTurno(value)}
              />
            </Form.Field>

            <Header as="h4">Horários da Disciplina</Header>
            {horarios.map((bloco, index) => (
              <Segment key={index} secondary>
                <Form.Field>
                  <label>Dia da Semana:*</label>
                  <Form.Select
                    fluid
                    placeholder="Selecione o dia"
                    options={opcoesDias}
                    value={bloco.dia}
                    onChange={(e, { value }) => atualizarHorario(index, "dia", value)}
                  />
                </Form.Field>
                <Form.Group widths="equal">
                  <Form.Select
                    fluid
                    label="Início"
                    options={opcoesHorarios}
                    value={bloco.horaInicio}
                    onChange={(e, { value }) => atualizarHorario(index, "horaInicio", value)}
                  />
                  <Form.Select
                    fluid
                    label="Fim"
                    options={opcoesHorarios}
                    value={bloco.horaFim}
                    onChange={(e, { value }) => atualizarHorario(index, "horaFim", value)}
                  />
                </Form.Group>
                {horarios.length > 1 && (
                  <Button type="button" color="red" size="mini" onClick={() => removerHorario(index)}>
                    Remover Bloco
                  </Button>
                )}
              </Segment>
            ))}

            <Button type="button" icon labelPosition="left" onClick={adicionarHorario} style={{ marginBottom: '1em' }}>
              <Icon name="add" /> Adicionar Horário
            </Button>

            <Button fluid size="huge" style={{ backgroundColor: "#21ba45", color: "#fff" }} onClick={salvar}>
              Concluir
            </Button>
          </Form>
        </Segment>
      </Grid.Column>
    </Grid>
  );
}
