import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Divider, Header, Icon, Modal, Table, Form, Segment, Menu } from "semantic-ui-react";
import "./Interface.css";
import { notifyError, notifySuccess } from "../util/Util";
import { getErrorMessage } from "../util/getErrorMessage";
import "./css/turmas.css";

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
        <section className="container-turmas" style={{ padding: "2%" }}>
          
          {/* TOPO DA TABELA UNIFICADO */}
          <div className="topo-tabela" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1%" }}>
            <div>
              <Header as="h2" className="titulo-pagina" style={{ margin: 0, textAlign: "left" }}>
                Cursos cadastrados
              </Header>
            </div>

            <Button
              className="btn-nova-turma"
              color="yellow"
              icon="clipboard outline"
              labelPosition="left"
              as={Link}
              to="/cadastro-curso"
              content="Novo curso"
            />
          </div>

          <Divider />

          {/* BOTÃO DO MENU DE FILTRO */}
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

          {/* FORMULÁRIO DE FILTROS */}
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

          {/* VERIFICAÇÃO DE LISTA VAZIA OU EXIBIÇÃO DA TABELA */}
          {lista.length === 0 ? (
            <div className="estado-vazio" style={{ textAlign: "center", padding: "5% 0" }}>
              <div className="icone-vazio" style={{ fontSize: "3em", color: "#ccc", marginBottom: "15px" }}>
                <Icon name="users" />
              </div>
              <h3>Nenhum curso cadastrado ainda</h3>
              <p style={{ color: "#777" }}>
                Cadastre um novo curso para começar.
              </p>
            </div>
          ) : (
            <div className="tabela-wrapper">
              <Table color="green" sortable celled className="tabela-turmas">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Curso</Table.HeaderCell>
                    <Table.HeaderCell>Área</Table.HeaderCell>
                    <Table.HeaderCell>Total de períodos</Table.HeaderCell>
                    <Table.HeaderCell textAlign="center" width={3}>Ações</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {lista.map((curso) => (
                    <Table.Row key={curso.id}>
                      <Table.Cell>
                        <div className="curso-cell" style={{ fontWeight: "bold" }}>
                          {curso.nome}
                        </div>
                      </Table.Cell>
                      <Table.Cell>{curso.area}</Table.Cell>
                      <Table.Cell>
                        <div className="periodo-badge">
                          {curso.qtdPeriodos}
                        </div>
                      </Table.Cell>

                      {/* BOTÕES DE AÇÃO REORGANIZADOS NO PADRÃO LIMPO */}
                      <Table.Cell textAlign="center">
                        <div className="acoes-tabela" style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                          <Button
                            className="btn-action-minimal"
                            icon
                            as={Link}
                            to="/cadastro-curso"
                            state={{ id: curso.id }}
                            title="Clique aqui para editar os dados do curso"
                          >
                            <Icon name="edit outline" />
                          </Button>

                          <Button
                            className="btn-action-minimal btn-remover"
                            icon
                            color="red"
                            basic
                            onClick={(e) => confirmaRemover(curso.id)}
                            title="Clique aqui para remover o curso"
                          >
                            <Icon name="trash alternate outline" />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </section>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
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
