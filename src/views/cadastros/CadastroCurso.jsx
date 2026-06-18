import { Button, Form, Grid, Segment, Header, Icon } from "semantic-ui-react";
import axios from "axios";
import { notifyError, notifySuccess } from "../../views/util/Util";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../util/getErrorMessage";
import "../logins/estilo.css";

export default function CadastroCurso() {
  const { state } = useLocation();

  const [idCurso, setIdCurso] = useState();
  const [opcoesDisciplinas, setOpcoesDisciplinas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [nome, setNome] = useState();
  const [qtdPeriodos, setQtdPeriodos] = useState();
  const [area, setArea] = useState();
  const navigate = useNavigate();

  const opcoesArea = [
    { key: "TI", text: "Tecnologia da Informação", value: "ti" },
    { key: "ADM", text: "Administração", value: "adm" },
    { key: "LOGS", text: "Logística", value: "logs" },
    { key: "COM", text: "Comércio", value: "com" },
    { key: "QUA", text: "Qualidade", value: "qual" },
  ];

  const opcoesCurso = [
    { key: "IPI", text: "Informática para Internet", value: "ipi" },
    { key: "QUAL", text: "Qualidade", value: "qual" },
    { key: "ADM", text: "Administração", value: "adm" },
    {
      key: "ADS",
      text: "Análise e desenvolvimento de sistemas",
      value: "ads",
    },
  ];

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/disciplina")
      .then((response) => {
        const formatadas = response.data.map((d) => ({
          key: d.id,
          text: d.nome,
          value: d.id,
        }));
        setOpcoesDisciplinas(formatadas);
      })
      .catch((error) => {

        const erros = error.response?.data?.errors;

        if (erros?.length > 0) {

          erros.forEach(e => {
            notifyError(e.defaultMessage);
          });

        } else {
          notifyError(getErrorMessage(error));
        }

      });
  }, []);

  useEffect(() => {
    if (state != null && state.id != null) {
      axios
        .get("http://localhost:8080/api/curso/" + state.id)
        .then((response) => {
          setIdCurso(response.data.id);
          setNome(response.data.nome);
          setArea(response.data.area);
          setQtdPeriodos(response.data.qtdPeriodos);

          if (response.data.disciplinas && typeof response.data.disciplinas[0] === 'object') {
            setDisciplinas(response.data.disciplinas.map(d => d.id));
          } else {
            setDisciplinas(response.data.disciplinas || []);
          }
        })
        .catch((error) => {

          const erros = error.response?.data?.errors;

          if (erros?.length > 0) {

            erros.forEach(e => {
              notifyError(e.defaultMessage);
            });

          } else {
            notifyError(getErrorMessage(error));
          }

        });
    }
  }, [state]);

  function salvar() {
    let cursoRequest = {
      nome: nome,
      area: area,
      qtdPeriodos: qtdPeriodos,
      disciplinas: disciplinas
    };

    if (idCurso != null) {
      axios
        .put("http://localhost:8080/api/curso/" + idCurso, cursoRequest)
        .then(() => {
          notifySuccess("Curso alterado com sucesso.");
          navigate("/cursos");
        })
        .catch((error) => {

          const erros = error.response?.data?.errors;

          if (erros?.length > 0) {

            erros.forEach(e => {
              notifyError(e.defaultMessage);
            });

          } else {
            notifyError(getErrorMessage(error));
          }

        });
    } else {
      axios
        .post("http://localhost:8080/api/curso", cursoRequest)
        .then(() => {
          notifySuccess("Curso cadastrado com sucesso.");
          navigate("/cursos");
        })
        .catch((error) => {

          const erros = error.response?.data?.errors;

          if (erros?.length > 0) {

            erros.forEach(e => {
              notifyError(e.defaultMessage);
            });

          } else {
            notifyError(getErrorMessage(error));
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
            {idCurso === undefined ? (
              <h2>
                <span style={{ color: "darkgray" }}>
                  Cadastro <Icon name="angle double right" size="small" />
                </span>{" "}
                Curso
              </h2>
            ) : (
              <h2>
                <span style={{ color: "darkgray" }}>
                  Alteração <Icon name="angle double right" size="small" />
                </span>{" "}
                Curso
              </h2>
            )}
          </Header>

          <Form size="large">
            <Form.Field style={{ marginBottom: "2em", textAlign: "left" }}>
              <Form.Select
                fluid
                label="nome do curso:"
                placeholder="Selecione o curso"
                options={opcoesCurso}
                required
                value={nome}
                onChange={(e, { value }) => setNome(value)}
              />
            </Form.Field>

            <Form.Field style={{ marginBottom: "2em", textAlign: "left" }}>
              <Form.Select
                fluid
                multiple
                search
                label="Disciplinas do curso:"
                placeholder="Selecione as disciplinas"
                options={opcoesDisciplinas}
                required
                value={disciplinas}
                onChange={(e, { value }) => setDisciplinas(value)}
              />
            </Form.Field>

            <Form.Field style={{ marginBottom: "2em", textAlign: "left" }}>
              <Form.Select
                fluid
                label="Área:"
                required
                options={opcoesArea}
                placeholder="Selecione a área"
                value={area}
                onChange={(e, { value }) => setArea(value)}
              />
            </Form.Field>

            <Form.Field style={{ marginBottom: "2em", textAlign: "left" }}>
              <Form.Input
                fluid
                label="Quantidade de períodos:"
                required
                type="number"
                placeholder="Ex: 6"
                value={qtdPeriodos}
                onChange={(e, { value }) => setQtdPeriodos(value)}
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