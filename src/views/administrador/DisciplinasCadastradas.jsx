import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Divider,
  Grid,
  Header,
  Icon,
  Modal,
  Form,
  Segment,
  Menu,
} from "semantic-ui-react";
import { notifyError } from "../util/Util";
import { getErrorMessage } from "../util/getErrorMessage";
import "./Interface.css";

export default function DisciplinasCadastradas() {
  const [lista, setLista] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [idRemover, setIdRemover] = useState();

  const [menuFiltro, setMenuFiltro] = useState();
  const [nome, setNome] = useState();
  const [idCurso, setIdCurso] = useState();
  const [listaCurso, setListaCurso] = useState([]);

  useEffect(() => {
    carregarLista();
    axios.get("http://localhost:8080/api/curso").then((response) => {
      const dropDownCursos = [];
      dropDownCursos.push({ text: "", value: "" });
      response.data.map((c) =>
        dropDownCursos.push({ text: c.nome, value: c.id }),
      );

      setListaCurso(dropDownCursos);
    });
  }, []);

  function carregarLista() {
    axios
      .get("http://localhost:8080/api/disciplina")
      .then((response) => {
        setLista(response.data);
      })
      .catch((error) => {
        const erros = error.response?.data?.errors;

        if (erros?.length > 0) {
          erros.forEach((e) => {
            notifyError(e.defaultMessage);
          });
        } else {
          notifyError(getErrorMessage(error));
        }
      });
  }

  function confirmaRemover(id) {
    setOpenModal(true);
    setIdRemover(id);
  }

  async function remover() {
    await axios
      .delete("http://localhost:8080/api/disciplina/" + idRemover)
      .then(() => {
        carregarLista();
        setOpenModal(false);
      })
      .catch((error) => {
        const erros = error.response?.data?.errors;

        if (erros?.length > 0) {
          erros.forEach((e) => {
            notifyError(e.defaultMessage);
          });
        } else {
          notifyError(getErrorMessage(error));
        }
      });
  }

  function handleMenuFiltro() {
    if (menuFiltro === true) {
      setMenuFiltro(false);
    } else {
      setMenuFiltro(true);
    }
  }

  function handleChangeNome(value) {
    setNome(value);
    filtrarcursos(value, idCurso);
  }

  function handleChangeIdCurso(value) {
    setIdCurso(value);
    filtrarcursos(nome, value);
  }

  async function filtrarcursos(nomeParam, idCursoParam) {
    let formData = new FormData();

    if (nomeParam) {
      formData.append("nome", nomeParam);
    }
    if (idCursoParam) {
      formData.append("idCurso", idCursoParam);
    }

    await axios
      .post("http://localhost:8080/api/disciplina/filtrar", formData)
      .then((response) => {
        setLista(response.data);
      })
      .catch((error) => {
        console.error("Erro ao filtrar disciplinas:", error);
      });
  }
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "2%",
        minHeight: "100vh",
      }}
    >
      <Header as="h2" style={{ margin: 0, textAlign: "left" }}>
        Disciplinas cadastradas
      </Header>
      <Divider style={{ marginVertical: "2%" }} />

      <Menu compact>
        <Menu.Item
          name="menuFiltro"
          active={menuFiltro === true}
          onClick={() => handleMenuFiltro()}
        >
          <Icon name="filter" />
          Filtrar
        </Menu.Item>
      </Menu>
      <br />
      <br />
      <Grid columns={4} stackable>
        {/* Card de Atalho para Novo Cadastro */}
        <Grid.Column>
          <Card
            as={Link}
            to="/cadastro-disciplina"
            style={{
              textAlign: "center",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Card.Content>
              <Icon
                name="plus"
                size="large"
                style={{ color: "#aaaaaa", fontWeight: "lighter" }}
              />
              <div
                style={{
                  marginTop: "15px",
                  color: "#a3a3a3",
                  fontWeight: "bold",
                }}
              >
                cadastrar nova Disciplina
              </div>
            </Card.Content>
          </Card>
        </Grid.Column>

        {menuFiltro ? (
          <Segment>
            <Form className="form-filtros">
              <Form.Group widths="equal">
                <Form.Input
                  icon="search"
                  value={nome}
                  onChange={(e) => handleChangeNome(e.target.value)}
                  label="Nome"
                  placeholder="Filtrar por nome"
                  labelPosition="left"
                  width={4}
                />
                <Form.Select
                  placeholder="Filtrar por Curso"
                  label="Curso"
                  options={listaCurso}
                  value={idCurso}
                  onChange={(e, { value }) => {
                    handleChangeIdCurso(value);
                  }}
                />
              </Form.Group>
            </Form>
          </Segment>
        ) : (
          ""
        )}
        {/* Mapeamento direto da lista sem filtros */}
        {lista.map((item) => (
          <Grid.Column key={item.id}>
            <Card fluid>
              <Card.Content>
                <Card.Header>{item.nome}</Card.Header>
                <Card.Meta>Carga Horária: {item.chTotal}h</Card.Meta>
                <Card.Meta>Período Ofertado: {item.periodoOfertado}</Card.Meta>
                <Card.Description>
                  Curso: {item.curso ? item.curso.nome : "N/A"}
                </Card.Description>
              </Card.Content>

              <Card.Content extra>
                <div className="ui two buttons">
                  <Button
                    as={Link}
                    to="/cadastro-disciplina"
                    state={{ id: item.id }}
                    icon="edit"
                    color="blue"
                    basic
                  />
                  <Button
                    icon="trash"
                    color="red"
                    basic
                    onClick={() => confirmaRemover(item.id)}
                  />
                </div>
              </Card.Content>
            </Card>
          </Grid.Column>
        ))}
      </Grid>

      <Modal
        basic
        onClose={() => setOpenModal(false)}
        open={openModal}
        size="small"
      >
        <Header icon>
          <Icon name="trash" /> Tem certeza que deseja remover?
        </Header>
        <Modal.Actions>
          <Button
            basic
            color="red"
            inverted
            onClick={() => setOpenModal(false)}
          >
            Não
          </Button>
          <Button color="green" inverted onClick={() => remover()}>
            Sim
          </Button>
        </Modal.Actions>
      </Modal>
    </section>
  );
}
