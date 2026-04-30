import React from "react";
import {
  Container,
  Grid,
  Header,
  Divider,
  Image,
  Icon
} from "semantic-ui-react";

import Navbar from "../../Components/navbar/NavbarProfessor";

export default function Perfil() {
  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      
      <Navbar tela={"perfil"} />

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

            <Header
              as="h2"
              style={{ marginBottom: "10px", fontWeight: "600" }}
            >
              Perfil
            </Header>

            <Divider style={{ marginBottom: "40px" }} />

 
            <Grid>
              <Grid.Row verticalAlign="middle">


                <Grid.Column width={4}>
                  <Image
                    src="https://pt.quizur.com/_image?href=https%3A%2F%2Fdev-beta.quizur.com%2Fstorage%2Fv1%2Fobject%2Fpublic%2F%2Fimagens%2F%2F20198516%2F08325843-82e4-44f2-a384-543616a37539.png&w=400&h=400&f=webp"
                    size="small"
                    circular
                  />
                </Grid.Column>

                <Grid.Column width={12}>


                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <h1
                      style={{
                        margin: 0,
                        fontSize: "28px",
                        fontWeight: "700"
                      }}
                    >
                      Bruno
                    </h1>

                    <Icon
                      name="edit"
                      size="large"
                      style={{ cursor: "pointer" }}
                    />
                  </div>

                  <Divider style={{ margin: "10px 0 15px 0" }} />
                    <div><br></br></div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "#777"
                    }}
                  >
                    Matéria:
                  </p>

                  <h2
                    style={{
                      marginTop: "5px",
                      fontSize: "20px",
                      color: "#888",
                      fontWeight: "600"
                    }}
                  >
                    Rede de Computadores
                  </h2>

                </Grid.Column>

              </Grid.Row>
            </Grid>
                <div><br></br></div>
            <div style={{ marginTop: "50px" }}>
              <Header
                as="h3"
                style={{ fontWeight: "600", marginBottom: "10px" }}
              >
                Histórico de Aulas
              </Header>

              <Divider />

              <p style={{ color: "#777", marginTop: "15px" }}>
                Nenhum histórico disponível no momento.
              </p>
            </div>

          </Container>
        </div>
      </div>
    </div>
  );
}