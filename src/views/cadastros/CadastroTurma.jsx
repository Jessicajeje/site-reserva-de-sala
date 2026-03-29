
import { Button, Form, Grid, Segment, Header } from "semantic-ui-react";
import {useState} from 'react';

const CadastroTurma = () => {
    const[curso, setCurso]= useState();
    const[periodo, setPeriodo]= useState();

        function salvar(){
      let turmaRequest = {
        curso: curso,
       periodo:periodo
      };
        console.log("tudo em cima chefe!")
    }

    
  return (
     <Grid textAlign="center" style={{ height: '100vh', backgroundColor: '#f4f4f4' }} verticalAlign="middle">
          <Grid.Column style={{ maxWidth: 500 }}>
    
            <Segment raised style={{ padding: '3em' }}>
              <Header as="h1" textAlign="center" style={{ marginBottom: '1.5em', fontSize: '2em' }}>
                Cadastro de Turma
              </Header>
    
              <Form size="large">
                
                <Form.Field style={{ marginBottom: '15%', textAlign: 'left' }}>
                  <label style={{ fontSize: '16px', marginBottom: '10px', textAlign: 'left' }}>Curso:*</label>
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

export default CadastroTurma