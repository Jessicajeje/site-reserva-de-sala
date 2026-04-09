import { Button, Form, Grid, Segment, Header } from "semantic-ui-react";
import axios from "axios";
import { notifyError, notifySuccess } from '../../views/util/Util';
import { useState } from "react";

//sistema de horários de 45 em 45 minutos
const gerarOpcoesHorarios = () => {
  const horarios = [];
  let data = new Date();
  data.setHours(7, 0, 0, 0); // Inicia às 07:00
  while (data.getHours() < 22 || (data.getHours() === 22 && data.getMinutes() === 0)) {
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
  const [nome, setNome] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [areaSelecionada, setAreaSelecionada] = useState("");

  const opcoesArea = [
    { key: "adm", text: "Administração", value: "administracao" },
    { key: "qual", text: "Gestão da Qualidade", value: "gestao_qualidade" },
    { key: "tech", text: "Tecnologia da Informação", value: "tecnologia_informacao" },
    { key: "proc", text: "Processos Gerenciais", value: "processos_gerenciais" },
    { key: "log", text: "Logística", vaLue: "logistica" },
  ];

  function salvar() {
    // Validação correta dos campos
    if (!nome || !areaSelecionada || !horaInicio || !horaFim) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    let disciplinaRequest = {
      area: areaSelecionada,
      nome: nome,
      horaInicio: horaInicio,
      horaFim: horaFim,
    };

 
      axios.post("http://localhost:8080/api/disciplina", disciplinaRequest)
       .then((response) => {
         notifySuccess("Disciplina cadastrado com sucesso!");
       })
       .catch((error) => {
         console.error(error);
         notifyError("Erro ao cadastrar disciplina. Verifique os dados.");
       });

  }

  return (
    <Grid textAlign="center" style={{ height: "100vh", backgroundColor: "#f4f4f4" }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 500 }}>
        <Segment raised style={{ padding: "3em" }}>
          <Header as="h1" textAlign="center" style={{ marginBottom: "1.5em", fontSize: "2em" }}>
            Cadastro de Disciplinas
          </Header>

          <Form size="large" style={{ textAlign: "left" }}>
            <Form.Field style={{ marginBottom: "1.5em" }}>
              <label style={{ fontSize: "16px", marginBottom: "10px" }}>Área da disciplina:*</label>
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

            <Form.Group widths="equal">
              <Form.Field>
                <label>Início:*</label>
                <Form.Select
                  fluid
                  placeholder="07:00"
                  options={opcoesHorarios}
                  value={horaInicio}
                  onChange={(e, { value }) => setHoraInicio(value)}
                />
              </Form.Field>

              <Form.Field>
                <label>Fim:*</label>
                <Form.Select
                  fluid
                  placeholder="07:40"
                  options={opcoesHorarios}
                  value={horaFim}
                  onChange={(e, { value }) => setHoraFim(value)}
                />
              </Form.Field>
            </Form.Group>
            <Button
              fluid
              size="huge"
              type="button" 
              style={{ backgroundColor: "#21ba45", color: "#fff", marginTop: "20px" }}
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
