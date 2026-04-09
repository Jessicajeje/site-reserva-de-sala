import axios from "axios";
import { notifyError, notifySuccess } from '../../views/util/Util';
import { Button, Form, Grid, Segment, Header } from "semantic-ui-react";
import {useState} from 'react';

const CadastroSala = () => {
    const opcoesBloco = [
    { key: "b", text: "Bloco B", value: "Bloco_B" },
    { key: "c", text: "Bloco C", value: "Bloco_C" },
    { key: "d", text: "Bloco D", value: "Bloco_D" },
    { key: "a", text: "Bloco A", value: "Bloco_A" }
    
  ];
    const[blocoSelecionado, setBlocoSelecionado]= useState();
    const[numero, setNumero]= useState();
    const [tipo, setTipo] = useState('sala');
    const atualizaTipo = (e, { value }) => setTipo(value);

    function salvar(){
      
      let salaRequest = {
        numero: numero,
        blocoSelecionado: blocoSelecionado,
        tipo: tipo
      };
      
           axios.post("http://localhost:8080/api/sala", salaRequest)
            .then((response) => {
              notifySuccess("Sala cadastrada com sucesso!");
            })
            .catch((error) => {
              console.error(error);
              notifyError("Erro ao cadastrar sala. Verifique os dados.");
            });

    }

  return (
    <Grid textAlign="center" style={{ height: '100vh', backgroundColor: '#f4f4f4' }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 500 }}>

        <Segment raised style={{ padding: '3em' }}>
          <Header as="h1" textAlign="center" style={{ marginBottom: '1.5em', fontSize: '2em' }}>
            Cadastro de sala/Laboratório
          </Header>

          <Form size="large">
            
            <Form.Field style={{ marginBottom: "1.5em" }}>
              <label style={{ fontSize: "16px", marginBottom: "10px" }}>A qual bloco a sala pertence?:*</label>
              <Form.Select
                fluid
                required
                placeholder="Selecione o bloco"
                options={opcoesBloco}
                value={blocoSelecionado}
                onChange={(e, { value }) => setBlocoSelecionado(value)}
              />
            </Form.Field>

            <Form.Field style={{ marginBottom: '15%', textAlign: 'left' }}>
              <label style={{ fontSize: '16px', marginBottom: '10px', textAlign: 'left' }}>Número da sala:*</label>
              <Form.Input
                fluid
                required
                type="number"
                value={numero}
                onChange={(e, { value }) => setNumero(value)}
              />
            </Form.Field>

          <Form.Group inline>
        <label>Tipo:</label>
        <Form.Radio
        label="Sala"
        name="radioGroup"
        value='sala'
        checked={tipo === 'sala'}
        onChange={atualizaTipo}/>

                <Form.Radio
        label="Laboratório"
        name="radioGroup"
        value='laboratorio'
        checked={tipo === 'laboratorio'}
        onChange={atualizaTipo}/>
          </Form.Group>

            <Button
              fluid
              size="huge"
              style={{ backgroundColor: "#21ba45", color: "#fff", padding: '15px' }}
              onClick ={salvar}
            >
              Concluir
            </Button>
          </Form>
        </Segment>

      </Grid.Column>
    </Grid>
  )
}

export default CadastroSala