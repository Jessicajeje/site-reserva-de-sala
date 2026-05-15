import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Divider, Header, Icon, Modal, Table } from "semantic-ui-react";
import './Interface.css';

export default function Cursos() {
  const [lista, setLista] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [idRemover, setIdRemover] = useState();

  useEffect(() => {
    carregarLista();
  }, []);

  function carregarLista() {
    axios.get("http://localhost:8080/api/curso").then((response) => {
      setLista(response.data);
    });
  }

  function confirmaRemover(id) {
    setOpenModal(true);
    setIdRemover(id);
  }

  async function remover() {
    await axios.delete('http://localhost:8080/api/curso/' + idRemover)
      .then((response) => {
        console.log('Curso removido com sucesso.')
        carregarLista();
      })
      .catch((error) => {
        console.log('Erro ao remover um curso.')
      })
    setOpenModal(false)
  }

  return (
    <div>
      <div style={{ marginTop: "3%" }}>
        <section textAlign="justified">
          <Header as='h2' style={{ textAlign: 'left', marginLeft: "2%", marginTop: '5%' }}>
            Cursos cadastrados
          </Header>
          <Divider />

          <div style={{ marginTop: "3%", padding: '2%' }}>
            <Button
              label="Novo curso"
              color="yellow"
              icon="clipboard outline"
              floated="right"
              as={Link}
              to="/cadastro-curso"
            />

            <br /><br /><br />

            {lista.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "5%" }}>
                <h3 style={{ opacity: 0.5, color: 'grey' }}>Nenhum curso cadastrado ainda.</h3>
              </div>
            ) : (
              <Table color="green" sortable celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Curso</Table.HeaderCell>
                    <Table.HeaderCell>Área</Table.HeaderCell>
                    <Table.HeaderCell>Total de períodos</Table.HeaderCell>
                    <Table.HeaderCell textAlign="center">Ações</Table.HeaderCell>
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
                          onClick={e => confirmaRemover(curso.id)}>
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
