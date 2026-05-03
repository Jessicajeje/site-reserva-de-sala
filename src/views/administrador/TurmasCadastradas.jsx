import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Divider, Header, Icon, Modal, Table } from "semantic-ui-react";
import './Interface.css';

export default function TurmasCadastradas() {
  const [lista, setLista] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [idRemover, setIdRemover] = useState();

  useEffect(() => {
    carregarLista();
  }, []);

  function carregarLista() {
    axios.get("http://localhost:8080/api/turma").then((response) => {
      setLista(response.data);
    });
  }

  function confirmaRemover(id) {
    setOpenModal(true);
    setIdRemover(id);
  }

  async function remover() {
    await axios.delete('http://localhost:8080/api/turma/' + idRemover)
      .then((response) => {
        console.log('Turma removida com sucesso.')
        carregarLista(); // Simplificado para chamar a função existente
      })
      .catch((error) => {
        console.log('Erro ao remover uma turma.')
      })
    setOpenModal(false)
  }

  return (
    <div>
      <div style={{ marginTop: "3%" }}>
        <section textAlign="justified">
          <Header as='h2' style={{ textAlign: 'left', marginLeft: "2%", marginTop: '5%' }}>
            Turmas cadastradas
          </Header>
          <Divider />

          <div style={{ marginTop: "3%", padding: '2%' }}>
            <Button
              label="Nova turma"
              color="yellow"
              icon="clipboard outline"
              floated="right"
              as={Link}
              to="/cadastro-turma"
            />

            <br /><br /><br />

            {lista.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "5%" }}>
                <h3 style={{ opacity: 0.5, color: 'grey' }}>Nenhuma turma cadastrada ainda.</h3>
              </div>
            ) : (
              <Table color="green" sortable celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Curso</Table.HeaderCell>
                    <Table.HeaderCell>Período</Table.HeaderCell>
                    <Table.HeaderCell textAlign="center">Ações</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {lista.map((turma) => (
                    <Table.Row key={turma.id}>
                      <Table.Cell>{turma.curso}</Table.Cell>
                      <Table.Cell>{turma.periodo}</Table.Cell>

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
                          onClick={e => confirmaRemover(turma.id)}>
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
