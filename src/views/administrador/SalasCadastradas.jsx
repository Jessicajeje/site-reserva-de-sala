import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Divider, Header, Icon, Modal, Card } from "semantic-ui-react";
import "./Interface.css";

export default function SalasCadastradas() {
  const [lista, setLista] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [idRemover, setIdRemover] = useState();

  useEffect(() => {
    carregarLista();
  }, []);

  function carregarLista() {
    axios.get("http://localhost:8080/api/sala")
      .then((response) => {
        setLista(response.data);
      })
      .catch((error) => {
        console.error("Erro na requisição:", error);
      });
  }

  function confirmaRemover(id) {
    setOpenModal(true);
    setIdRemover(id);
  }

  async function remover() {
    await axios
      .delete("http://localhost:8080/api/sala/" + idRemover)
      .then(() => {
        console.log("Sala removida com sucesso.");
        carregarLista();
      })
      .catch((error) => {
        console.log("Erro ao remover uma sala.");
      });
    setOpenModal(false);
  }

  return (
    <div>
      <div style={{ marginTop: "3%" }}>
        <section>
          <Header
            as="h2"
            style={{ textAlign: "left", marginLeft: "2%", marginTop: "5%" }}
          >
            Salas cadastradas
          </Header>
          <Divider />

          <div style={{ marginTop: "3%", padding: "2%" }}>
            <Button
              label="Nova sala"
              color="yellow"
              icon="clipboard outline"
              floated="right"
              as={Link}
              to="/cadastro-sala"
            />
            <br /><br /><br />

            {lista.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "5%" }}>
                <h3 style={{ opacity: 0.5, color: "grey" }}>
                  Nenhuma sala cadastrada ainda.
                </h3>
              </div>
            ) : (
              <Card.Group itemsPerRow={3} stackable style={{ padding: "1%" }}>
                {lista.map((sala) => (
                  <Card key={sala.id} raised color="green">
                    <Card.Content>
                      <Icon 
                        name={sala.tipo === 'laboratorio' ? 'lab' : 'university'} 
                        size="large" 
                        floated="right" 
                      />
                      <Card.Header>
                        {sala.tipo === 'laboratorio' ? 'Laboratório' : 'Sala'} {sala.numero}
                      </Card.Header>
                      <Card.Meta>
                        {sala.blocoSelecionado ? sala.blocoSelecionado.replace('_', ' ') : 'Bloco não informado'}
                      </Card.Meta>
                    </Card.Content>

                    <Card.Content extra>
                      <div className='ui two buttons'>
                        <Button 
                          basic 
                          color='blue' 
                          as={Link} 
                          to="/cadastro-sala" 
                          state={{ id: sala.id }}
                        >
                          <Icon name="edit" /> Editar
                        </Button>
                        <Button 
                          basic 
                          color='red' 
                          onClick={() => confirmaRemover(sala.id)}
                        >
                          <Icon name="trash" /> Remover
                        </Button>
                      </div>
                    </Card.Content>
                  </Card>
                ))}
              </Card.Group>
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
