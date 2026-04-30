import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Divider, Header, Icon, Modal, Table } from "semantic-ui-react";
import "./Interface.css";

export default function ProfessoresAtivos() {
  const [lista, setLista] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [idRemover, setIdRemover] = useState();

  useEffect(() => {
    carregarLista();
  }, []);

  function carregarLista() {
    axios.get("http://localhost:8080/api/professor").then((response) => {
      setLista(response.data);
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
        console.log("Professor removido com sucesso.");
        carregarLista(); // Atualiza a lista chamando a função novamente
      })
      .catch((error) => {
        console.log("Erro ao remover um professor.");
      });
    setOpenModal(false);
  }

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

        <div style={{ marginTop: "3%", padding: "2%" }}>
          {lista.length === 0 ? (
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
                {/* Mapeamento direto sem o .filter() */}
                {lista.map((professor) => (
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
          <Button basic color="red" inverted onClick={() => setOpenModal(false)}>
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
