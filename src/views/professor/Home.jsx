import React, { useState } from "react";
import { Link } from "react-router-dom";
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



export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

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
              as={Link}
              to="/reposicao"
            >
              <Icon name="plus" />
              Agendar reposição
            </Button>
          </Container>
        </div>
      </div>
    </div>
  );
}

