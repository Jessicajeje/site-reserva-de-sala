import { Button, Form, Grid, Segment, Header } from "semantic-ui-react";


const LoginProfessor = () => {
  return (
     <Grid textAlign="center" style={{ height: '100vh', backgroundColor: '#f4f4f4' }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 500 }}>
        
        <Segment raised style={{ padding: '3em' }}>
          <Header as="h1" textAlign="center" style={{ marginBottom: '1.5em', fontSize: '2em' }}>
            Log-in Professor
          </Header>

          <Form size="large">
            <Form.Field style={{ marginBottom: '10%', textAlign: 'left' }}>
              <label style={{ fontSize: '16px', marginBottom: '10px' }}>Senha do Administrador:*</label>
              <Form.Input 
                fluid 
                required
                type="password"
                placeholder="Digite sua senha"
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
          <p>Primeiro acesso?<a href="" style={{textAlign: 'center' , }}>Cadastre-se</a></p>
        </Segment>

      </Grid.Column>
    </Grid>
  )
}

export default LoginProfessor
