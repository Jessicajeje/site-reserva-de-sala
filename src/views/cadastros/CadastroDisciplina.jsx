import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation} from "react-router-dom";
import { Button, Form, Grid, Header, Icon, Segment } from "semantic-ui-react";
import { notifyError, notifySuccess, notifyWarn } from "../../views/util/Util";
import "../logins/estilo.css";
import { set } from "date-fns";

export default function CadastroDisciplina() {
  const { state } = useLocation();

  const navigate = useNavigate();

  const [idDisciplina, setIdDisciplina] = useState();
  const [nome, setNome] = useState("");
  const [opcoesCurso, setOpcoesCurso] = useState([]);
  const [idCurso, setIdCurso] = useState(null);
  const [periodoOfertado, setPeriodoOfertado] = useState();
  const [chTotal, setChTotal] = useState();

  const opcoesDias = [
    { key: "seg", text: "Segunda-feira", value: "SEGUNDA" },
    { key: "ter", text: "Terça-feira", value: "TERCA" },
    { key: "qua", text: "Quarta-feira", value: "QUARTA" },
    { key: "qui", text: "Quinta-feira", value: "QUINTA" },
    { key: "sex", text: "Sexta-feira", value: "SEXTA" },
    { key: "sab", text: "Sábado", value: "SABADO" },
  ];
  useEffect(() => {

    axios.get("http://localhost:8080/api/curso")
      .then((res) => {
        setOpcoesCurso(res.data.map(c => ({
          key: c.id,
          text: `${c.nome} - períodos: ${ c.qtdPeriodos}`,
          value: c.id
        })));
      });
    if (state?.id) {
      axios.get("http://localhost:8080/api/disciplina/" + state.id)
        .then((res) => {
          setIdDisciplina(res.data.id);
          setChTotal(res.data.chTotal);
          setPeriodoOfertado(res.data.periodoOfertado);
          setNome(res.data.nome);
          setIdCurso(res.data.idCurso);
        });
    }
  }, [state]);

  function salvar() {

    if (!nome || !chTotal || !idCurso ) {
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
        console.error(error);
        if (error.response.data.errors !== undefined) {
          for (let i = 0; i < error.response.data.errors.length; i++) {
            notifyError(error.response.data.errors[i].defaultMessage);
          }
        } else {
          notifyError(error.response.data.message);
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
