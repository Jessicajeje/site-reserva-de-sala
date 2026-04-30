import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Divider, Grid, Header, Icon, Modal } from "semantic-ui-react";
import './Interface.css';

export default function DisciplinasCadastradas() {
  const [lista, setLista] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [idRemover, setIdRemover] = useState();

  useEffect(() => { carregarLista(); }, []);

  function carregarLista() {
    axios.get("http://localhost:8080/api/disciplina").then((response) => {
      setLista(response.data);
    });
  }

  function confirmaRemover(id) {
    setOpenModal(true);
    setIdRemover(id);
  }

  async function remover() {
    await axios.delete('http://localhost:8080/api/disciplina/' + idRemover)
      .then(() => {
        carregarLista();
        setOpenModal(false);
      })
      .catch(() => console.log('Erro ao remover.'));
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', padding: '2%', minHeight: '100vh' }}>
      <Header as='h2' style={{ margin: 0 , textAlign: 'left'}}>
        Disciplinas cadastradas
      </Header>
      <Divider style={{ marginVertical: '2%' }} />

      <Grid columns={4} stackable>
        {/* Card de Atalho para Novo Cadastro */}
        <Grid.Column>
          <Card as={Link} to="/cadastro-disciplina" style={{ textAlign: 'center', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Card.Content>
              <Icon name="plus" size="large" style={{ color: '#aaaaaa', fontWeight: 'lighter' }} />
              <div style={{ marginTop: '15px', color: '#a3a3a3', fontWeight: 'bold' }}>
                cadastrar nova Disciplina
              </div>
            </Card.Content>
          </Card>
        </Grid.Column>

        {/* Mapeamento direto da lista sem filtros */}
        {lista.map((item) => (
          <Grid.Column key={item.id}>
            <Card fluid>
              <Card.Content>
                <Card.Header>{item.nome}</Card.Header>
                {/* Lembre-se: Verifique se o seu backend envia 'area' em vez de 'codigo' */}
                <Card.Meta>{item.area || "Sem área definida"}</Card.Meta>
                <Card.Description>
                   <Icon name="clock outline" /> {item.horarioInicio} - {item.horarioFim}
                </Card.Description>
              </Card.Content>

              <Card.Content extra>
                <div className='ui two buttons'>
                  <Button 
                    as={Link} 
                    to="/cadastro-disciplina"
                    state={{ id: item.id }}
                    icon="edit" 
                    color="blue" 
                    basic 
                  />
                  <Button 
                    icon="trash" 
                    color="red" 
                    basic 
                    onClick={() => confirmaRemover(item.id)} 
                  />
                </div>
              </Card.Content>
            </Card>
          </Grid.Column>
        ))}
      </Grid>

      <Modal basic onClose={() => setOpenModal(false)} open={openModal} size="small">
        <Header icon><Icon name='trash' /> Tem certeza que deseja remover?</Header>
        <Modal.Actions>
          <Button basic color='red' inverted onClick={() => setOpenModal(false)}>Não</Button>
          <Button color='green' inverted onClick={() => remover()}>Sim</Button>
        </Modal.Actions>
      </Modal>
    </section>
  );
}
