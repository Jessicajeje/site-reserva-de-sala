import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Divider,
  Header,
  Icon,
  Modal,
  Form,
  Segment,
  Menu,
} from "semantic-ui-react";
import { notifyError } from "../util/Util";
import { getErrorMessage } from "../util/getErrorMessage";
import "./css/disciplinas.css";
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

      <div style={{ marginBottom: "2%" }}>
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
      </div>

      {menuFiltro ? (
        <Segment style={{ marginBottom: "2%" }}>
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

      {/* AREA DA GRID DE CARDS COM ESTILOS CUSTOMIZADOS */}
      <div className="disciplinas-grid">

        {/* CARD FIXO DE CRIAÇÃO */}
        <Link to="/cadastro-disciplina" className="card-add-link">
          <Card className="card-add-new">
            <Card.Content className="card-add-content">
              <div className="add-icon-circle">
                <Icon name="plus" />
              </div>
              <span>cadastrar disciplina</span>
            </Card.Content>
          </Card>
        </Link>

        {/* LISTAGEM DINÂMICA */}
        {lista.map((item) => (
          <Card key={item.id} className="card-disciplina">
            <Card.Content>
              <div className="card-topo">
                <div>
                  <Card.Header className="titulo-disciplina">
                    {item.nome}
                  </Card.Header>

                  <Card.Meta className="meta-disciplina">
                    Curso: {item.curso ? item.curso.nome : "Sem curso definido"}
                  </Card.Meta>
                  
                  <div className="meta-disciplina" style={{ color: "rgba(0,0,0,.4)", fontSize: "0.9em", marginTop: "3px" }}>
                    Carga Horária: {item.chTotal}h | Período: {item.periodoOfertado}
                  </div>
                </div>

                <div className="icone-disciplina">
                  <Icon name="book" />
                </div>
              </div>

              {/* Exemplo de exibição de horários, caso existam no seu modelo */}
              <div className="horario-disciplina">
                <Icon name="clock outline" />
                Início: {item.horarioInicio || "00:00"}
                <span style={{ marginLeft: "10px" }}>
                  FIM: {item.horarioFim || "00:00"}
                </span>
              </div>
            </Card.Content>

            <Card.Content extra>
              <div className="acoes-card">

                <div className="acoes-direita">
                  <Button
                    className="btn-action-minimal"
                    icon
                    as={Link}
                    to="/cadastro-disciplina"
                    state={{ id: item.id }}
                  >
                    <Icon name="edit outline" />
                  </Button>

                  <Button
                    className="btn-action-minimal"
                    icon
                    color="red"
                    basic
                    onClick={() => confirmaRemover(item.id)}
                  >
                    <Icon name="trash alternate outline" />
                  </Button>
                </div>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* MENSAGEM SE A LISTA DE DISCIPLINAS RETORNAR VAZIA */}
      {lista.length === 0 && (
        <div className="mensagem-vazia" style={{ textAlign: "center", marginTop: "5%" }}>
          <h3 style={{ opacity: 0.5, color: "grey" }}>
            Nenhuma disciplina cadastrada ainda.
          </h3>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
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
