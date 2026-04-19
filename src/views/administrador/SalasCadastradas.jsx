import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Divider, Header, Icon, Modal, Table } from "semantic-ui-react";
import "./Interface.css";
import FiltroSala from "../../Components/filtros/FiltroSala";

export default function SalasCadastradas() {
  const [lista, setLista] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [idRemover, setIdRemover] = useState();
  const [buscaTipo, setBuscaTipo] = useState("");

  useEffect(() => {
    carregarLista();
  }, []);

  function carregarLista() {
    axios.get("http://localhost:8080/api/sala").then((response) => {
      setLista(response.data);
    });
  }

  function confirmaRemover(id) {
    setOpenModal(true);
    setIdRemover(id);
  }

  async function remover() {
    await axios
      .delete("http://localhost:8080/api/sala/" + idRemover)
      .then((response) => {
        console.log("Sala removida com sucesso.");

        axios.get("http://localhost:8080/api/sala").then((response) => {
          setLista(response.data);
        });
      })
      .catch((error) => {
        console.log("Erro ao remover uma sala.");
      });
    setOpenModal(false);
  }
  return (
    <div>
      <div style={{ marginTop: "3%" }}>
        <section textAlign="justified">
          <Header
            as="h2"
            style={{ textAlign: "left", marginLeft: "2%", marginTop: "5%" }}
          >
            Salas cadastradas
          </Header>
          <Divider />
          <FiltroSala setBuscaTipo={setBuscaTipo} />
          <div style={{ marginTop: "3%", padding: "2%" }}>
            <Button
              label="Nova sala"
              color="yellow"
              icon="clipboard outline"
              floated="right"
              as={Link}
              to="/cadastro-sala"
            />
            <br />
            <br />
            <br />
            {lista.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "5%" }}>
                <h3 style={{ opacity: 0.5, color: "grey" }}>
                  Nenhuma sala cadastrada ainda.
                </h3>
              </div>
            ) : (
              <Table color="green" sortable celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Curso</Table.HeaderCell>
                    <Table.HeaderCell>Período</Table.HeaderCell>

                    <Table.HeaderCell textAlign="center">
                      Ações
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {lista
                    .filter((sala) => sala.tipo.includes(buscaTipo))

                    .map((sala) => (
                      <Table.Row key={sala.id}>
                        <Table.Cell>{sala.curso}</Table.Cell>
                        <Table.Cell>{sala.periodo}</Table.Cell>

                        <Table.Cell textAlign="center">
                          <Button
                            inverted
                            circular
                            color="blue"
                            title="Clique aqui para editar os dados da sala"
                            icon
                          >
                            <Link
                              to="/cadastro-sala"
                              state={{ id: sala.id }}
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
                            title="Clique aqui para remover a sala"
                            icon
                            onClick={(e) => confirmaRemover(sala.id)}
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
