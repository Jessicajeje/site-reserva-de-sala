import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Form, Grid, Header, Icon, Segment } from "semantic-ui-react";
import { notifyError, notifySuccess, notifyWarn } from "../../views/util/Util";
import { getErrorMessage } from "../util/getErrorMessage";
import "../logins/estilo.css";

export default function CadastroDisciplina() {
  const { state } = useLocation();

  const navigate = useNavigate();

  const [idDisciplina, setIdDisciplina] = useState();
  const [nome, setNome] = useState("");
  const [opcoesCurso, setOpcoesCurso] = useState([]);
  const [idCurso, setIdCurso] = useState(null);
  const [periodoOfertado, setPeriodoOfertado] = useState();
  const [chTotal, setChTotal] = useState();

  useEffect(() => {

    axios.get("http://localhost:8080/api/curso")
      .then((response) => {

        const cursosFormatados = response.data.map((curso) => ({
          key: curso.id,
          text: curso.nome,
          value: curso.id,
        }));

        setOpcoesCurso(cursosFormatados);
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

    if (state?.id) {
      axios.get("http://localhost:8080/api/disciplina/" + state.id)
        .then((res) => {
          setIdDisciplina(res.data.id);
          setChTotal(res.data.chTotal);
          setPeriodoOfertado(res.data.periodoOfertado);
          setNome(res.data.nome);
          setIdCurso(res.data.idCurso);
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

        });;
    }
  }, [state]);

  function salvar() {

    if (!nome || !chTotal || !idCurso) {
      notifyWarn("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const disciplinaRequest = {
      nome: nome,
      chTotal: chTotal,
      periodoOfertado: periodoOfertado,
      idCurso: idCurso
    };

    const request = idDisciplina
      ? axios.put(`http://localhost:8080/api/disciplina/${idDisciplina}`, disciplinaRequest)
      : axios.post("http://localhost:8080/api/disciplina", disciplinaRequest);

    request
      .then(() => {
        notifySuccess(idDisciplina ? "Alterada com sucesso!" : "Cadastrada com sucesso!");
        setTimeout(() => navigate("/disciplinas"), 1000); // Redireciona após salvar
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

            <Form.Input
              fluid
              required
              label="Nome da disciplina:*"
              placeholder="Ex: Algoritmos II"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <Form.Input
              fluid
              label="Período ofertado:"
              required
              type="number"
              value={periodoOfertado}
              onChange={(e) => setPeriodoOfertado(e.target.value)}
            />
            <Form.Field style={{ marginBottom: "2em", textAlign: "left" }}>
              <Form.Input
                fluid
                label="Carga horária:"
                required
                type="number"
                placeholder="Ex: 1"
                value={chTotal}
                onChange={(e, { value }) => setChTotal(value)}
              />
            </Form.Field>

            <Form.Field>
              <Form.Select
                fluid
                required
                label="Curso:"
                placeholder="Selecione o curso"
                options={opcoesCurso}
                value={idCurso}
                onChange={(e, { value }) => setIdCurso(value)}
                noResultsMessage="Nenhuma turma encontrada."
              />
            </Form.Field>

            <Button
              fluid
              size="huge"
              type="button"
              style={{
                backgroundColor: "#21ba45",
                color: "#fff",
                marginTop: "1em",
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
