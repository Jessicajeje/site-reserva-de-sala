import {Container,  Divider,  Grid,  Header, Icon, Image} from "semantic-ui-react";
import Navbar from "../../Components/navbar/NavbarProfessor";

export default function Notificacoes() {
  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      
      <Navbar tela={"notificacoes"} />

      <div style={{ display: "flex" }}>
        
        <div
          style={{
            width: "220px",
            backgroundColor: "#fff",
            minHeight: "100vh",
            borderRight: "1px solid #ddd"
          }}
        />

        <div style={{ flex: 1, padding: "40px 50px" }}>
          <Container fluid>

            <Header as="h2"
              style={{ marginBottom: "10px", fontWeight: "600" }}
            > Notificações </Header>

            <Divider style={{ marginBottom: "40px" }} />

 
            <Grid>
              <Grid.Row verticalAlign="middle">
                <Grid.Column width={12}>


                  <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <Icon
                      name="bell outline"
                      size="large"
                      style={{ cursor: "pointer" }}
                    />
                  </div>

                 
                    <div><br></br></div>



                </Grid.Column>

              </Grid.Row>
            </Grid>
                <div><br></br></div>
            <div style={{ marginTop: "50px" }}>
              <Divider />
            </div>
            <div style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center"
                    }}>
                 <Icon
                      name="star outline"
                      size="big"
                      style={{ cursor: "pointer" }}
                    />

                    <Icon
                      name="trash alternate outline"
                      size="big"
                      style={{ cursor: "pointer" }}
                    />

                
                </div> 
          </Container>
        </div>
      </div>
    </div>
  );
}