import { Button, Form, Grid, Segment, Header, Icon} from "semantic-ui-react";
import {useState} from 'react';

const CadastroDisciplina = () => {
        const [curso, setCurso]= useState();
        const [nome, setNome]= useState();
        const [horaInicio, setHoraInicio]= useState();
        const [horaFim, setHoraFim]= useState();

    function salvar(){
      let DisciplinaRequest = {
        curso: curso,
        nome: nome,
        horaInicio: horaInicio,
        horaFim: horaFim
      };
        console.log("tudo em cima chefe!")
    }

  return (
 <Grid textAlign="center" style={{ height: '100vh', backgroundColor: '#f4f4f4' }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 500 }}>

        <Segment raised style={{ padding: '3em' }}>
          <Header as="h1" textAlign="center" style={{ marginBottom: '1.5em', fontSize: '2em' }}>
            Cadastro de Disciplinas
          </Header>

          <Form size="large">
            
            <Form.Field style={{ marginBottom: '15%', textAlign: 'left' }}>
              <label style={{ fontSize: '16px', marginBottom: '10px', textAlign: 'left' }}>Área da disciplina:*</label>
              <Form.Input
                fluid
                required
                type="text"
              />
            </Form.Field>

            <Form.Field style={{ marginBottom: '15%', textAlign: 'left' }}>
              <label style={{ fontSize: '16px', marginBottom: '10px', textAlign: 'left' }}>Nome da disciplina:*</label>
              <Form.Input
                fluid
                required
                type="text"
              />
            </Form.Field>
                        <Form.Field style={{ marginBottom: '15%', textAlign: 'left' }}>
              <label style={{ fontSize: '16px', marginBottom: '10px', textAlign: 'left' }}>Horário de início:*</label>
              <Form.Input
                fluid
                required
                type="text"
              />
            </Form.Field>
                                    <Form.Field style={{ marginBottom: '15%', textAlign: 'left' }}>
              <label style={{ fontSize: '16px', marginBottom: '10px', textAlign: 'left' }}>Horário de Fim:*</label>
              <Form.Input
                fluid
                required
                type="text"
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

export default CadastroDisciplina