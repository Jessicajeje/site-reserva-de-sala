import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Divider,
  Header,
  Icon,
  Modal,
  Table,
  Form,
  Segment,
  Menu,
} from "semantic-ui-react";
import "./Interface.css";
import { notifyError, notifySuccess } from "../util/Util";
import { getErrorMessage } from "../util/getErrorMessage";

export default function ProfessoresAtivos() {
  const [lista, setLista] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [idRemover, setIdRemover] = useState();

  const [menuFiltro, setMenuFiltro] = useState();
  const [nome, setNome] = useState();
  const [cpf, setCpf] = useState();

  useEffect(() => {
    carregarLista();
  }, []);

  function carregarLista() {
    axios
      .get("http://localhost:8080/api/professor")
      .then((response) => {
        const professoresAtivos = response.data.filter(
          (professor) => professor.ativo === true,
        );
        setLista(professoresAtivos);
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
      .delete("http://localhost:8080/api/professor/" + idRemover)
      .then((response) => {
        notifySuccess("Professor removido com sucesso.");
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
    filtrarcursos(value, cpf);
  }

  function handleChangeCpf(value) {
    setCpf(value);
    filtrarcursos(nome, value);
  }

  async function filtrarcursos(nomeParam, cpfParam) {
    let formData = new FormData();

    if (nomeParam) {
      formData.append("nome", nomeParam);
    }
    if (cpfParam) {
      formData.append("cpf", cpfParam);
    }
     await axios
      .post("http://localhost:8080/api/professor/filtrar", formData)
      .then((response) => {
        setLista(response.data);
      })
      .catch((error) => {
        console.error("Erro ao filtrar professores:", error);
      })}
    return (
      <div style={{ marginTop: "3%" }}>
        <section textAlign="justified">
          <Header
            as="h2"
            style={{ textAlign: "left", marginLeft: "2%", marginTop: "5%" }}
          >
            Professores Ativos
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
                      value={cpf}
                      onChange={(e) => handleChangeCpf(e.target.value)}
                      label="CPF"
                      placeholder="Filtrar por CPF"
                      labelPosition="left"
                     width={4}
                    />
                  </Form.Group>
                </Form>
              </Segment>
            ) : (
              ""
            )}

          <div style={{ marginTop: "3%", padding: "2%" }}>
            {!lista || lista.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "5%" }}>
                <h3 style={{ opacity: 0.5, color: "grey" }}>
                  Nenhum professor cadastrado ainda.
                </h3>
              </div>
            ) : (
              <Table color="green" sortable celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Nome</Table.HeaderCell>
                    <Table.HeaderCell>CPF</Table.HeaderCell>
                    <Table.HeaderCell>E-mail</Table.HeaderCell>
                    <Table.HeaderCell>SIAPE</Table.HeaderCell>
                    <Table.HeaderCell textAlign="center">
                      Ações
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {lista?.map((professor) => (
                    <Table.Row key={professor.id}>
                      <Table.Cell>{professor.nome}</Table.Cell>
                      <Table.Cell>{professor.cpf}</Table.Cell>
                      <Table.Cell>{professor.email}</Table.Cell>
                      <Table.Cell>{professor.siape}</Table.Cell>
                      <Table.Cell textAlign="center">
                        <Button
                          inverted
                          circular
                          color="red"
                          title="Clique aqui para remover o professor"
                          icon
                          onClick={() => confirmaRemover(professor.id)}
                        >
                          <Icon name="trash" />
                        </Button>
                        <Button
                          inverted
                          circular
                          color="blue"
                          title="Clique aqui para editar"
                          icon
                          as={Link}
                          to="/cadastro-professor"
                          state={{ id: professor.id }}
                        >
                          <Icon name="edit" />
                        </Button>
                        &nbsp;
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </div>
        </section>

        <Modal
          basic
          onClose={() => setOpenModal(false)}
          onOpen={() => setOpenModal(true)}
          open={openModal}
        >
          <Header icon>
            <Icon name="trash" />
            <div style={{ marginTop: "5%" }}>
              Tem certeza que deseja remover esse registro?
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

