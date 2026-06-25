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

export default function TurmasCadastradas() {
  const [lista, setLista] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [idRemover, setIdRemover] = useState();

  const [menuFiltro, setMenuFiltro] = useState();
  const [nome, setNome] = useState("");
  const [turno, setTurno] = useState("");
  const [idCurso, setIdCurso] = useState("");
  const [listaCurso, setListaCurso] = useState([]);

  useEffect(() => {
    carregarLista();
    axios.get("http://localhost:8080/api/curso").then((response) => {
      const dropDownCurso = [];
      dropDownCurso.push({ text: "", value: "" });
      response.data.map((c) =>
        dropDownCurso.push({ text: c.nome, value: c.id }),
      );

      setListaCurso(dropDownCurso);
    });
  }, []);

  function carregarLista() {
    axios
      .get("http://localhost:8080/api/turma")
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
      .delete("http://localhost:8080/api/turma/" + idRemover)
      .then((response) => {
        notifySuccess("Turma removida com sucesso.");
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
    filtrarTurmas(value, idCurso, turno);
  }

  function handleChangeIdCurso(value) {
    setIdCurso(value);
    filtrarTurmas(nome, value, turno);
  }

  function handleChangeTurno(value) {
    setTurno(value);
    filtrarTurmas(nome, idCurso, value);
  }

  async function filtrarTurmas(nomeParam, idCursoParam, turnoParam) {
    let formData = new FormData();

    if (nomeParam) {
      formData.append("nome", nomeParam);
    }
    if (idCursoParam) {
      formData.append("idCurso", idCursoParam);
    }
    if (turnoParam) {
      formData.append("turno", turnoParam);
    }

    await axios
      .post("http://localhost:8080/api/turma/filtrar", formData)
      .then((response) => {
        setLista(response.data);
      })
      .catch((error) => {
        console.error("Erro ao filtrar turmas:", error);
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
            Turmas cadastradas
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
              label="Nova turma"
              color="yellow"
              icon="clipboard outline"
              floated="right"
              as={Link}
              to="/cadastro-turma"
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
                      value={turno}
                      onChange={(e) => handleChangeTurno(e.target.value)}
                      label="Turno"
                      placeholder="Filtrar por turno"
                      labelPosition="left"
                      width={4}
                    />
                    <Form.Select
                      placeholder="Filtrar por Curso"
                      label="Curso"
                      options={listaCurso}
                      value={idCurso}
                      width={4}
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

            {lista.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "5%" }}>
                <h3 style={{ opacity: 0.5, color: "grey" }}>
                  Nenhuma turma cadastrada ainda.
                </h3>
              </div>
            ) : (
              <Table color="green" sortable celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Nome</Table.HeaderCell>
                    <Table.HeaderCell>Turno</Table.HeaderCell>
                    <Table.HeaderCell>Ano Entrada</Table.HeaderCell>
                    <Table.HeaderCell>Semestre Entrada</Table.HeaderCell>
                    <Table.HeaderCell>Qtd. Máx Alunos</Table.HeaderCell>
                    <Table.HeaderCell>Alunos Matriculados</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell textAlign="center">
                      Ações
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {lista.map((turma) => (
                    <Table.Row key={turma.id}>
                      <Table.Cell>{turma.nome}</Table.Cell>
                      <Table.Cell>{turma.turno}</Table.Cell>
                      <Table.Cell>{turma.anoEntrada}</Table.Cell>
                      <Table.Cell>{turma.semestreEntrada}</Table.Cell>
                      <Table.Cell>{turma.qtdMaximaAlunos}</Table.Cell>
                      <Table.Cell>{turma.qtdAlunosMatriculados}</Table.Cell>
                      <Table.Cell>
                        {turma.statusTurma ? "Ativa" : "Desativada"}
                      </Table.Cell>

                      <Table.Cell textAlign="center">
                        <Button
                          inverted
                          circular
                          color="blue"
                          title="Clique aqui para editar os dados da turma"
                          icon
                        >
                          <Link
                            to="/cadastro-turma"
                            state={{ id: turma.id }}
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
                          title="Clique aqui para remover a turma"
                          icon
                          onClick={(e) => confirmaRemover(turma.id)}
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
