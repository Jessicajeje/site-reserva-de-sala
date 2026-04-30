import { Button, Form, Grid, Segment, Header, Icon } from "semantic-ui-react";
import axios from "axios";
import { notifyError, notifySuccess } from "../../views/util/Util";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../logins/estilo.css";

const CadastroTurma = () => {
  const {state} = useLocation();
  const opcoesCurso = [
    { key: "IPI", text: "Informática para Internet", value: "ipi" },
    { key: "QUAL", text: "Qualidade", value: "qual" },
    { key: "ADM", text: "Administração", value: "adm" },
    { key: "ADS", text: "Análise e desenvolvimento de sistemas", value: "ads" },
  ];
  const [idTurma, setIdTurma] = useState();
  const [curso, setCurso] = useState();
  const [periodo, setPeriodo] = useState();

    useEffect(() => {
    if (state != null && state.id != null) {
      axios
        .get("http://localhost:8080/api/turma/" + state.id)
        .then((response) => {
          setIdTurma(response.data.id);
          setCurso(response.data.curso);
          setPeriodo(response.data.periodo);
        });
    }
  
  }, [state]);

  function salvar() {
    let turmaRequest = {
      curso: curso,
      periodo: periodo,
    };

    if (idTurma != null) {
      //Alteração:
      axios
        .put("http://localhost:8080/api/turma/" + idTurma, turmaRequest)
        .then((response) => {
          notifySuccess("Turma alterada com sucesso.");
        })
        .catch((error) => {
          notifyError("Erro ao alterar uma turma.");
        });
    } else {
      //Cadastro:
      axios
        .post("http://localhost:8080/api/turma", turmaRequest)
        .then((response) => {
          notifySuccess("Turma cadastrada com sucesso.");
        })
        .catch((error) => {
          notifyError("Erro ao incluir a turma.");
        });
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
            {idTurma === undefined && (
              <h2>
                {" "}
                <span style={{ color: "darkgray" }}>
                  {" "}
                  Cadastro &nbsp;
                  <Icon name="angle double right" size="small" />{" "}
                </span>{" "}
                Turma
              </h2>
            )}
            {idTurma !== undefined && (
              <h2>
                {" "}
                <span style={{ color: "darkgray" }}>
                  {" "}
                  Alteração &nbsp;
                  <Icon name="angle double right" size="small" />{" "}
                </span>{" "}
                Turma
              </h2>
            )}
          </Header>

          <Form size="large">
            <Form.Field style={{ marginBottom: "15%", textAlign: "left" }}>
              <label
                style={{
                  fontSize: "16px",
                  marginBottom: "10px",
                  textAlign: "left",
                }}
              >
                Curso:*
              </label>
              <Form.Select
                fluid
                options={opcoesCurso}
                required
                value={curso}
                onChange={(e, { value }) => setCurso(value)}
              />
            </Form.Field>

            <Form.Field style={{ marginBottom: "15%", textAlign: "left" }}>
              <label
                style={{
                  fontSize: "16px",
                  marginBottom: "10px",
                  textAlign: "left",
                }}
              >
                Período:*
              </label>
              <Form.Input
                fluid
                required
                type="number"
                value={periodo}
                onChange={(e, { value }) => setPeriodo(value)}
              />
            </Form.Field>

            <Button
              fluid
              size="huge"
              style={{
                backgroundColor: "#21ba45",
                color: "#fff",
                padding: "15px",
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

export default CadastroTurma;
