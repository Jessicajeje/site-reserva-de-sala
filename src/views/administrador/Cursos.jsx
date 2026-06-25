import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Divider, Header, Icon, Modal, Table, Form, Segment, Menu } from "semantic-ui-react";
import "./Interface.css";
import { notifyError, notifySuccess } from "../util/Util";
import { getErrorMessage } from "../util/getErrorMessage";

export default function Cursos() {
  const [lista, setLista] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [idRemover, setIdRemover] = useState();

  const [menuFiltro, setMenuFiltro] = useState();
  const [nome, setNome] = useState();
  const [area, setArea] = useState();

  useEffect(() => {
    carregarLista();
  }, []);

  function carregarLista() {
    axios
      .get("http://localhost:8080/api/curso")
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
      .delete("http://localhost:8080/api/curso/" + idRemover)
      .then((response) => {
        notifySuccess("Curso removido com sucesso.");
        carregarLista();
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
    setOpenModal(false);
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
    filtrarcursos(value, area);
  }

  function handleChangeArea(value) {
    setArea(value);
    filtrarcursos(nome, value);
  }

  async function filtrarcursos(nomeParam, areaParam) {
    let formData = new FormData();

    if (nomeParam) {
      formData.append("nome", nomeParam);
    }
    if (areaParam) {
      formData.append("area", areaParam);
    }

    await axios
      .post("http://localhost:8080/api/curso/filtrar", formData)
      .then((response) => {
        setLista(response.data);
      })
      .catch((error) => {
        console.error("Erro ao filtrar cursos:", error);
      });
  }
  return (
    <div>
      <div style={{ marginTop: "3%" }}>
        <section textAlign="justified">
          <Header
            as="h2"
            style={{ textAlign: "left", marginLeft: "2%", marginTop: "5%" }}
          >
            Cursos cadastrados
          </Header>
          <Divider />

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

          <div style={{ marginTop: "3%", padding: "2%" }}>
            <Button
              label="Novo curso"
              color="yellow"
              icon="clipboard outline"
              floated="right"
              as={Link}
              to="/cadastro-curso"
            />

            <br />
            <br />
            <br />

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
                  
                    <Form.Input
                      icon="search"
                      value={area}
                      onChange={(e) => handleChangeArea(e.target.value)}
                      label="Área"
                      placeholder="Filtrar por área"
                      labelPosition="left"
                     width={4}
                    />
                  </Form.Group>
                </Form>
              </Segment>
            ) : (
              ""
            )}

            {lista.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "5%" }}>
                <h3 style={{ opacity: 0.5, color: "grey" }}>
                  Nenhum curso cadastrado ainda.
                </h3>
              </div>
            ) : (
              <Table color="green" sortable celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Curso</Table.HeaderCell>
                    <Table.HeaderCell>Área</Table.HeaderCell>
                    <Table.HeaderCell>Total de períodos</Table.HeaderCell>
                    <Table.HeaderCell textAlign="center">
                      Ações
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {lista.map((curso) => (
                    <Table.Row key={curso.id}>
                      <Table.Cell>{curso.nome}</Table.Cell>
                      <Table.Cell>{curso.area}</Table.Cell>
                      <Table.Cell>{curso.qtdPeriodos}</Table.Cell>

                      <Table.Cell textAlign="center">
                        <Button
                          inverted
                          circular
                          color="blue"
                          title="Clique aqui para editar os dados do curso"
                          icon
                        >
                          <Link
                            to="/cadastro-curso"
                            state={{ id: curso.id }}
                            style={{ color: "blue" }}
                          >
                            <Icon name="edit" />
                          </Link>
                        </Button>
                        &nbsp;
                        <Button
                          inverted
                          circular
                          color="red"
                          title="Clique aqui para remover o curso"
                          icon
                          onClick={(e) => confirmaRemover(curso.id)}
                        >
                          <Icon name="trash" />
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </div>
        </section>
      </div>

      <Modal
        basic
        onClose={() => setOpenModal(false)}
        onOpen={() => setOpenModal(true)}
        open={openModal}
      >
        <Header icon>
          <Icon name="trash" />
          <div style={{ marginTop: "5%" }}>
            {" "}
            Tem certeza que deseja remover esse registro?{" "}
          </div>
        </Header>
        <Modal.Actions>
          <Button
            basic
            color="red"
            inverted
            onClick={() => setOpenModal(false)}
          >
            <Icon name="remove" /> Não
          </Button>
          <Button color="green" inverted onClick={() => remover()}>
            <Icon name="checkmark" /> Sim
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
}
