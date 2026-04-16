import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, Divider, Grid, Header, Icon, Modal } from "semantic-ui-react";
import Navbar from "../../Components/navbar/NavbarADM";
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
      <section style={{ display: 'flex', minHeight: '100vh' }}>
    {/* Navbar fixa na esquerda */}
    <aside style={{ width: '250px', flexShrink: 0 }}>
      <Navbar />
    </aside>
    
      <Header as='h2'>
        Disciplinas cadastradas
      </Header>
      <Divider style={{ marginBottom: '5%' }}/><br />

      <Grid columns={4} stackable style={{ marginTop: "3%" , padding:'2%'}}>
    

<Grid.Column>
  <Card as={Link} to="/cadastro-disciplina" className="card-add-new" style={{ textAlign: 'center'}}>
    <Card.Content >
      <Icon name="plus" size="large" style={{ color: '#aaaaaa', fontWeight: 'lighter', marginTop:'40%' }} />
      <div style={{ marginTop: '15px', color: '#a3a3a3', fontWeight: 'bold' }}>
        cadastrar nova Disciplina
      </div>
    </Card.Content>
  </Card>
</Grid.Column>

{lista.map((item) => (
  <Grid.Column key={item.id}>
    <Card fluid className="card-list-item">
      <Card.Content>
        <Card.Header>{item.nome}</Card.Header>
        <Card.Meta>Código: {item.codigo}</Card.Meta>
      </Card.Content>

      <Card.Content extra>
        <div className='ui two buttons'>
          {/* Botão Alterar: Redireciona para a tela de cadastro passando o ID */}
          <Button 
            as={Link} 
            to={`/cadastro-disciplina/${item.id}`} 
            icon="edit" 
            color="blue" 
            basic 
          />

          {/* Botão Excluir: Aciona o modal de confirmação */}
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
