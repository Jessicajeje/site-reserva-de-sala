import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Button,
    Divider,
    Icon,
    Table,
    Modal,
    Header
} from "semantic-ui-react";
import { notifyError, notifySuccess } from '../../views/util/Util';
import { getErrorMessage } from "../util/getErrorMessage";

export default function ListAlocacaoAula() {

    const [lista, setLista] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [idRemover, setIdRemover] = useState();

    useEffect(() => {
        carregarLista();
    }, []);

    function carregarLista() {
        axios.get("http://localhost:8080/api/alocacao-aula")
            .then((response) => {
                setLista(response.data);
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

    function abrirModal(id) {
        setIdRemover(id);
        setOpenModal(true);
    }

    async function remover() {

        await axios.delete('http://localhost:8080/api/alocacao-aula/' + idRemover)
            .then((response) => {

                notifySuccess('Alocação de aula removida com sucesso.')

                axios.get("http://localhost:8080/api/alocacao-aula")
                    .then((response) => {
                        setLista(response.data)
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
        setOpenModal(false)
    }

   return (
  <div style={{ marginTop: "3%" }}>
    <section className="container-turmas" style={{ padding: "2%" }}>
      
      {/* TOPO DA TABELA COM TÍTULO E BOTÕES UNIFICADOS */}
      <div className="topo-tabela" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1%" }}>
        <div>
          <Header as="h2" className="titulo-pagina" style={{ margin: 0, textAlign: "left" }}>
            <span style={{ color: "darkgray" }}>
              Listagem &nbsp;
              <Icon name="angle double right" size="small" />
            </span>
            Alocação de Aula
          </Header>
        </div>

        {/* GRUPO DE BOTÕES ALINHADOS À DIREITA */}
        <div style={{ display: "flex", gap: "12px" }}>
          <Button
            className="btn-nova-turma"
            as={Link}
            to={"/cadastro-alocacao-aula"}
            icon = "plus"
            labelPosition="left"
            content="Nova Alocação"
          />

          <Button
            className="btn-nova-turma"
            style={{ 
              background: "#2185d0", 
              boxShadow: "0 4px 12px rgba(33,133,208,0.18)" 
            }}
            as={Link}
            to={"/grade-alocacao-aula"}
            icon = "eye"
            labelPosition="left"
            content="Ver Grade"
          />
        </div>
      </div>

      <Divider />

      {/* SE A LISTA DE ALOCAÇÕES ESTIVER VAZIA */}
      {!lista || lista.length === 0 ? (
        <div className="estado-vazio" style={{ textAlign: "center", padding: "5% 0" }}>
          <div className="icone-vazio" style={{ fontSize: "3em", color: "#ccc", marginBottom: "15px" }}>
            <Icon name="calendar alternate outline" />
          </div>
          <h3>Nenhuma alocação cadastrada ainda</h3>
          <p style={{ color: "#777" }}>
            Crie uma nova alocação de aula para começar a montar os horários.
          </p>
        </div>
      ) : (
        /* TABELA DE LISTAGEM PADRONIZADA */
        <div className="tabela-wrapper">
          <Table color="green" sortable celled className="tabela-turmas">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={1}>ID</Table.HeaderCell>
                <Table.HeaderCell>Turma</Table.HeaderCell>
                <Table.HeaderCell>Disciplina</Table.HeaderCell>
                <Table.HeaderCell width={1}>Sala</Table.HeaderCell>
                <Table.HeaderCell>Professor</Table.HeaderCell>
                <Table.HeaderCell width={2}>Semestre</Table.HeaderCell>
                <Table.HeaderCell textAlign="center" width={3}>Ações</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {lista.map((alocacao) => (
                <Table.Row key={alocacao.id}>
                  <Table.Cell>{alocacao.id}</Table.Cell>
                  
                  <Table.Cell>
                    <div className="curso-cell">
                      {alocacao.turma?.nome || "N/A"}
                    </div>
                  </Table.Cell>
                  
                  <Table.Cell>{alocacao.disciplina?.nome || "N/A"}</Table.Cell>
                  
                  <Table.Cell>
                    <div className="periodo-badge" style={{ minWidth: "30px", height: "30px" }}>
                      {alocacao.sala?.numero || "N/A"}
                    </div>
                  </Table.Cell>
                  
                  <Table.Cell>{alocacao.professor?.nome || "N/A"}</Table.Cell>
                  
                  <Table.Cell>{alocacao.semestreLetivo}</Table.Cell>

                  {/* AÇÕES DA TABELA REESTRUTURADAS */}
                  <Table.Cell textAlign="center">
                    <div className="acoes-tabela" style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                      <Button
                        className="btn-action-minimal"
                        icon
                        as={Link}
                        to="/cadastro-alocacao-aula"
                        state={{ id: alocacao.id }}
                        title="Clique aqui para editar os dados"
                      >
                        <Icon name="edit outline" />
                      </Button>

                      <Button
                        className="btn-action-minimal btn-remover"
                        icon
                        color="red"
                        basic
                        onClick={() => abrirModal(alocacao.id)}
                        title="Clique aqui para remover"
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
        <Icon name='trash' />
        <div style={{ marginTop: '5%' }}> Tem certeza que deseja remover esse registro? </div>
      </Header>
      <Modal.Actions>
        <Button basic color='red' inverted onClick={() => setOpenModal(false)}>
          <Icon name='remove' /> Não
        </Button>
        <Button color='green' inverted onClick={() => remover()}>
          <Icon name='checkmark' /> Sim
        </Button>
      </Modal.Actions>
    </Modal>
  </div>
);

}