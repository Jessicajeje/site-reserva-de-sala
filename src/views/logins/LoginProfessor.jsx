import { Link } from "react-router-dom";
import { Button, Form, Grid, Header, Segment } from "semantic-ui-react";
import './estilo.css';

const LoginProfessor = () => {
  return (
     <Grid textAlign="center" style={{ height: '100vh', backgroundColor: '#f4f4f4' }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 500 }}>
        
        <Segment raised style={{ padding: '3em' }}>
          <Header as="h1" textAlign="center" style={{ marginBottom: '1.5em', fontSize: '2em' }}>
            Log-in Docente
          </Header>

          <Form size="large">
            <Form.Field style={{ marginBottom: '10%', textAlign: 'left' }}>
              <label style={{ fontSize: '16px', marginBottom: '10px' }}>E-mail institucional:</label>
              <Form.Input 
                fluid 
                required
                type="text"
                placeholder="Digite seu E-mail:"
              />
            </Form.Field>
                        <Form.Field style={{ marginBottom: '15%', textAlign: 'left' }}>
              <label style={{ fontSize: '16px', marginBottom: '10px' }}>Senha:*</label>
              <Form.Input 
                fluid 
                required
                type="text"
                placeholder="Digite sua senha"
              />
            </Form.Field>

            <Button 
              fluid 
              size="huge" 
              style={{ backgroundColor: "#21ba45", color: "#fff", padding: '15px' ,marginBottom:'15%'}}
            >
              Entrar
            </Button>
          </Form>
         <Link to={'/cadastro-professor'}> <p>Primeiro acesso? Cadastre-se</p></Link>
          <Link to={'/login-adm'}> <p>Login administrador</p></Link>
        </Segment>

      </Grid.Column>
    </Grid>
  )
}

export default LoginProfessor
