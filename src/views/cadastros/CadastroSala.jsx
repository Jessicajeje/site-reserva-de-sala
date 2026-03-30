import React from 'react'
import { Button, Form, Grid, Segment, Header } from "semantic-ui-react";
import {useState} from 'react';

const CadastroSala = () => {
    const [bloco, setBloco]= useState();
    const[numero, setNumero]= useState();
    const [tipo, setTipo] = useState('sala');
    const atualizaTipo = (e, { value }) => setTipo(value);

    function salvar(){
      let salaRequest = {
        numero: numero,
        bloco: bloco,
        tipo: tipo
      };
        console.log("tudo em cima chefe!")
    }

  return (
    <Grid textAlign="center" style={{ height: '100vh', backgroundColor: '#f4f4f4' }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 500 }}>

        <Segment raised style={{ padding: '3em' }}>
          <Header as="h1" textAlign="center" style={{ marginBottom: '1.5em', fontSize: '2em' }}>
            Cadastro de sala/Laboratório
          </Header>

          <Form size="large">
            
            <Form.Field style={{ marginBottom: '15%', textAlign: 'left' }}>
              <label style={{ fontSize: '16px', marginBottom: '10px', textAlign: 'left' }}>A qual bloco a sala pertence:*</label>
              <Form.Input
                fluid
                required
                type="text"
              />
            </Form.Field>

            <Form.Field style={{ marginBottom: '15%', textAlign: 'left' }}>
              <label style={{ fontSize: '16px', marginBottom: '10px', textAlign: 'left' }}>Número da sala:*</label>
              <Form.Input
                fluid
                required
                type="number"
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
roup
            <Button
              fluid
              size="huge"
              style={{ backgroundColor: "#21ba45", color: "#fff", padding: '15px' }}
              onChange ={salvar()}
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