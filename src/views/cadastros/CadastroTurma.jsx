import { Button, Form, Grid, Segment, Header, Icon } from "semantic-ui-react";
import axios from "axios";
import { notifyError, notifySuccess } from "../../views/util/Util";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../logins/estilo.css";

export default function CadastroTurma() {
  const { state } = useLocation();
  const [idCurso, setIdCurso] = useState();
  const [idTurma, setIdTurma] = useState();
  const [nome, setNome] = useState();
  const [semestreEntrada, setSemestreEntrada] = useState();
  const [anoEntrada, setAnoEntrada] = useState();
  const [alunosMatriculados, setAlunosMatriculados] = useState();
  const [qntMaxAlunos, setQntMaxAlunos] = useState();
  const semestres = [
    { key: "1", text: "1", value: "1" },
    { key: "2", text: "2", value: "2" },
  ];
  const [opcoesCurso, setOpcoesCurso] = useState([]);

  useEffect(() => {
    if (state != null && state.id != null) {
      axios
        .get("http://localhost:8080/api/turma/" + state.id)
        .then((response) => {
          setIdTurma(response.data.id);
          setNome(response.data.nome);
          setSemestreEntrada(response.data.semestreEntrada);
          setAnoEntrada(response.data.anoEntrada);
          setAlunosMatriculados(response.data.alunosMatriculados);
          setQntMaxAlunos(response.data.qntMaxAlunos);
        });

      axios.get("http://localhost:8080/api/curso").then((response) => {
        setIdCurso(response.data.id);
        const cursosFormatados = response.data.map((curso) => ({
          key: curso.id,
          text: curso.nome,
          value: curso.id,
        }));
        setOpcoesCurso(cursosFormatados);
      });
    }
  }, [state]);

  function salvar() {
    let turmaRequest = {
      nome: nome,
      curso: idCurso,
      semestreEntrada: semestreEntrada,
      anoEntrada: anoEntrada,
      alunosMatriculados: alunosMatriculados,
      qntMaxAlunos: qntMaxAlunos,
    };

    if (idTurma != null) {
      axios
        .put("http://localhost:8080/api/turma/" + idTurma, turmaRequest)
        .then(() => {
          notifySuccess("Turma alterada com sucesso.");
        })
        .catch((error) => {
          if (error.response.data.errors !== undefined) {
            for (let i = 0; i < error.response.data.errors.length; i++) {
              notifyError(error.response.data.errors[i].defaultMessage);
            }
          } else {
            notifyError(error.response.data.message);
          }
        });
    } else {
      axios
        .post("http://localhost:8080/api/turma", turmaRequest)
        .then(() => {
          notifySuccess("Turma cadastrada com sucesso.");
        })
        .catch((error) => {
          if (error.response.data.errors !== undefined) {
            for (let i = 0; i < error.response.data.errors.length; i++) {
              notifyError(error.response.data.errors[i].defaultMessage);
            }
          } else {
            notifyError(error.response.data.message);
          }
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
          <Header as="h1" textAlign="center" style={{ marginBottom: "1.5em" }}>
            {idTurma === undefined ? (
              <h2>
                <span style={{ color: "darkgray" }}>
                  Cadastro <Icon name="angle double right" size="small" />
                </span>{" "}
                Turma
              </h2>
            ) : (
              <h2>
                <span style={{ color: "darkgray" }}>
                  Alteração <Icon name="angle double right" size="small" />
                </span>{" "}
                Turma
              </h2>
            )}
          </Header>

          <Form size="large">
            <Form.Field style={{ marginBottom: "2em", textAlign: "left" }}>
              <Form.Input
                fluid
                label="Nome da turma:"
                placeholder="ex: ads-2020.2"

                value={nome}
                onChange={(e, { value }) => setNome(value)}
              />
              <Form.Select
                fluid
                label="Curso:"
                placeholder="Selecione o curso"
                options={opcoesCurso}
                required
                value={idCurso}
                onChange={(e, { value }) => setIdCurso(value)}
              />
            </Form.Field>
            <Form.Group widths="equal">
              <Form.Field style={{ marginBottom: "2em", textAlign: "left" }}>
                <Form.Input
                  fluid
                  label="Ano de Entrada:"
                  required
                  type="number"
                  placeholder="Ex: 2020"
                  value={anoEntrada}
                  onChange={(e, { value }) => setAnoEntrada(value)}
                />
              </Form.Field>
              <Form.Field style={{ marginBottom: "2em", textAlign: "left" }}>
                <Form.Select
                  fluid
                  label="Semestre de Entrada:"
                  required
                  options={semestres}
                  value={semestreEntrada}
                  onChange={(e, { value }) => setSemestreEntrada(value)}
                />
              </Form.Field>
            </Form.Group>

            <Form.Field style={{ marginBottom: "2em", textAlign: "left" }}>
              <Form.Input
                fluid
                label="Quantidade Máxima de Alunos:"
                required
                type="number"
                placeholder="Ex: 30"
                value={qntMaxAlunos}
                onChange={(e, { value }) => setQntMaxAlunos(value)}
              />
            </Form.Field>
            <Form.Field style={{ marginBottom: "2em", textAlign: "left" }}>
              <Form.Input
                label="Quantidade de Alunos Matriculados:"
                fluid
                required
                type="number"
                placeholder="Ex: 25"
                value={alunosMatriculados}
                onChange={(e, { value }) => setAlunosMatriculados(value)}
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
}
