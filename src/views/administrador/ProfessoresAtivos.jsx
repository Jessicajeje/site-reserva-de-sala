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
import "./css/turmas.css";

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
    <section className="container-turmas" style={{ padding: "2%" }}>
      
      {/* TOPO DA PÁGINA PADRONIZADO COM O FLUXO DE TURMAS */}
      <div className="topo-tabela" style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "1%" }}>
        <div>
          <Header as="h2" className="titulo-pagina" style={{ margin: 0, textAlign: "left" }}>
            Professores Ativos
          </Header>
        </div>
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

      {/* VERIFICAÇÃO SE A LISTA ESTÁ VAZIA OU NULA */}
      {!lista || lista.length === 0 ? (
        <div className="estado-vazio" style={{ textAlign: "center", padding: "5% 0" }}>
          <div className="icone-vazio" style={{ fontSize: "3em", color: "#ccc", marginBottom: "15px" }}>
            <Icon name="users" />
          </div>
          <h3>Nenhum professor cadastrado ainda</h3>
        </div>
      ) : (
        /* TABELA DE LISTAGEM COM AS PROPRIEDADES DE TURMAS */
        <div className="tabela-wrapper">
          <Table color="green" sortable celled className="tabela-turmas">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Nome</Table.HeaderCell>
                <Table.HeaderCell>CPF</Table.HeaderCell>
                <Table.HeaderCell>E-mail</Table.HeaderCell>
                <Table.HeaderCell>SIAPE</Table.HeaderCell>
                <Table.HeaderCell textAlign="center" width={3}>Ações</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {lista?.map((professor) => (
                <Table.Row key={professor.id}>
                  <Table.Cell>
                    <div className="curso-cell" style={{ fontWeight: "bold" }}>
                      {professor.nome}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{professor.cpf}</Table.Cell>
                  <Table.Cell>{professor.email}</Table.Cell>
                  <Table.Cell>
                    <div className="periodo-badge">
                      {professor.siape}
                    </div>
                  </Table.Cell>

                  {/* BOTÕES DE AÇÃO REORGANIZADOS E ALINHADOS */}
                  <Table.Cell textAlign="center">
                    <div className="acoes-tabela" style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                      <Button
                        className="btn-action-minimal"
                        icon
                        as={Link}
                        to="/cadastro-professor"
                        state={{ id: professor.id }}
                        title="Clique aqui para editar"
                      >
                        <Icon name="edit outline" />
                      </Button>

                      <Button
                        className="btn-action-minimal btn-remover"
                        icon
                        color="red"
                        basic
                        onClick={() => confirmaRemover(professor.id)}
                        title="Clique aqui para remover o professor"
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

