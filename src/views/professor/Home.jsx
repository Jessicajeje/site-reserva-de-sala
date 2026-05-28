import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Container,
  Divider,
  Form,
  Grid,
  Header,
  Icon,
  Image,
  Modal
} from "semantic-ui-react";

import Navbar from "../../Components/navbar/NavbarProfessor";

export default function Home() {

  const [open, setOpen] = useState(false);

  const [reservas, setReservas] = useState([]);

  const [editando, setEditando] = useState(null);

  const [formData, setFormData] = useState({
    professor: "",
    disciplina: "",
    data: "",
    horaInicial: "",
    horaFinal: "",
    sala: "",
    observacoes: ""
  });

  // Atualiza os campos
  function handleChange(e, { name, value }) {
    setFormData({
      ...formData,
      [name]: value
    });
  }

  // Salvar reserva
  function salvarReserva() {

    // EDIÇÃO
    if (editando !== null) {

      const novasReservas = reservas.map((item, index) => {
        if (index === editando) {
          return formData;
        }

        return item;
      });

      setReservas(novasReservas);

      setEditando(null);

    } else {

      // NOVA RESERVA
      setReservas([...reservas, formData]);
    }

    // Limpa formulário
    setFormData({
      professor: "",
      disciplina: "",
      data: "",
      horaInicial: "",
      horaFinal: "",
      sala: "",
      observacoes: ""
    });

    setOpen(false);
  }

  // Editar reserva
  function editarReserva(index) {

    setFormData(reservas[index]);

    setEditando(index);

    setOpen(true);
  }

  // Excluir reserva
  function excluirReserva(index) {

    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta reserva?"
    );

    if (confirmar) {

      const novasReservas = reservas.filter(
        (_, i) => i !== index
      );

      setReservas(novasReservas);
    }
  }

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

      <Navbar tela={"home"} />

      <div style={{ display: "flex" }}>

        {/* CONTEÚDO */}
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