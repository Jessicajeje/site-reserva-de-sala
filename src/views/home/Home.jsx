import React, { useState } from "react";
import {
  Container,
  Grid,
  Card,
  Button,
  Icon,
  Header,
  Divider,
  Image,
  Modal,
  Form
} from "semantic-ui-react";

import Navbar from "../../Components/navbar/NavbarProfessor";

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      
      <Navbar tela={"home"} />

      <div style={{ display: "flex" }}>
        
        <div
          style={{
            width: "220px",
            backgroundColor: "#fff",
            minHeight: "100vh",
            borderRight: "1px solid #ddd",
            padding: "20px"
          }}
        >
          <Header as="h4" color="grey">
            Navegação
          </Header>

          <p style={{ color: "#999999c2" }}>
          </p>
        </div>

        <div style={{ flex: 1, padding: "30px" }}>
          <Container fluid>

            <Header as="h1">
              Início - Meus agendamentos
            </Header>

            <Divider />

            <Button
              color="green"
              icon
              labelPosition="left"
              onClick={() => setOpen(true)}
            >
              <Icon name="plus" />
              Agendar aula
            </Button>

            <Modal
              open={open}
              onClose={() => setOpen(false)}
              size="small"
            >
              <Modal.Header>Reserva de Sala</Modal.Header>

              <Modal.Content>
                <Form>
                  <Form.Input
                    label="Professor"
                    placeholder="Digite o nome"
                  />

                  <Form.Input
                    label="Disciplina"
                    placeholder="Ex: Redes de Computadores"
                  />

                  <Form.Group widths="equal">
                    <Form.Input
                      type="date"
                      label="Data"
                    />

                    <Form.Input
                      type="time"
                      label="Hora Inicial"
                    />

                    <Form.Input
                      type="time"
                      label="Hora Final"
                    />
                  </Form.Group>

                  <Form.Input
                    label="Sala / Laboratório"
                    placeholder="Ex: Lab 07"
                  />

                  <Form.TextArea
                    label="Observações"
                    placeholder="Informações adicionais..."
                  />
                </Form>
              </Modal.Content>

              <Modal.Actions>
                <Button onClick={() => setOpen(false)}>
                  Cancelar
                </Button>

                <Button color="green">
                  <Icon name="check" />
                  Salvar Reserva
                </Button>
              </Modal.Actions>
            </Modal>

            {/* CARD EXEMPLO DO PROFESSOR */}
            <Grid style={{ marginTop: "30px" }} columns={3}>
              <Grid.Row>
                <Grid.Column>
                  <Card fluid>
                    <Card.Content>
                      <Image
                        floated="left"
                        size="mini"
                        circular
                        src="https://pt.quizur.com/_image?href=https%3A%2F%2Fdev-beta.quizur.com%2Fstorage%2Fv1%2Fobject%2Fpublic%2F%2Fimagens%2F%2F20198516%2F08325843-82e4-44f2-a384-543616a37539.png&w=400&h=400&f=webp"
                      />

                      <Card.Header style={{ marginTop: "10px" }}>
                        Bruno
                      </Card.Header>

                      <Card.Meta style={{ marginTop: "10px" }}>
                       Projeto e Pratica 2
                      </Card.Meta>

                      <Card.Description style={{ marginTop: "10px" }}>
                        16/04/2026 <br />
                        Quinta-feira <br /><br />
                        13:30 - 16:00 <br />
                        Lab 07
                      </Card.Description>
                    </Card.Content>

                    <Card.Content extra>
                      <Button size="small" color="blue" floated="left">
                        <Icon name="edit" />
                        Editar
                      </Button>

                      <Button
                        size="small"
                        color="red"
                        floated="right"
                      >
                        <Icon name="trash" />
                        Cancelar
                      </Button>
                    </Card.Content>
                  </Card>
                </Grid.Column>
              </Grid.Row>
            </Grid>

          </Container>
        </div>
      </div>
    </div>
  );
}

