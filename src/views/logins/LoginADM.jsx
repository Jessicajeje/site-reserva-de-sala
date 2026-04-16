import { Button, Form, Grid, Header, Segment } from "semantic-ui-react";
import './estilo.css';

const LoginADM = () => {
  return (
    <Grid textAlign="center" style={{ height: '100vh', backgroundColor: '#f4f4f4' }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 500 }}>
        
        <Segment raised style={{ padding: '3em' }}>
          <Header as="h1" textAlign="center" style={{ marginBottom: '1.5em', fontSize: '2em' }}>
            Log-in Administrador
          </Header>

          <Form size="large">
            <Form.Field style={{ marginBottom: '15%', textAlign: 'left' }}>
              <label style={{ fontSize: '16px', marginBottom: '10px' , textAlign:'center'  }}>E-mail do Administrador:*</label>
              <Form.Input 
                fluid 
                required
                type="text"
                placeholder="Digite o e-mail"
              />
            </Form.Field>
                      <Form.Field style={{ marginBottom: '15%', textAlign: 'left' }}>
              <label style={{ fontSize: '16px', marginBottom: '10px' , textAlign:'center'  }}>Senha do Administrador:*</label>
              <Form.Input 
                fluid 
                required
                type="password"
                placeholder="Digite a senha"
              />
            </Form.Field>

            <Button 
              fluid 
              size="huge" 
              style={{ backgroundColor: "#21ba45", color: "#fff", padding: '15px' }}
            >
              Entrar
            </Button>
          </Form>
        </Segment>

      </Grid.Column>
    </Grid>
  );
};

export default LoginADM;
