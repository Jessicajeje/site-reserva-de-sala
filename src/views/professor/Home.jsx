import { useState } from "react";
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

        {/* MENU LATERAL */}
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
        </div>

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
              onClick={() => {
                setEditando(null);

                setFormData({
                  professor: "",
                  disciplina: "",
                  data: "",
                  horaInicial: "",
                  horaFinal: "",
                  sala: "",
                  observacoes: ""
                });

                setOpen(true);
              }}
            >
              <Icon name="plus" />
              Agendar reposição
            </Button>

            {/* MODAL */}
            <Modal
              open={open}
              onClose={() => setOpen(false)}
              size="small"
            >

              <Modal.Header>
                {editando !== null
                  ? "Editar Reserva"
                  : "Reserva de Sala"}
              </Modal.Header>

              <Modal.Content>

                <Form>

                  <Form.Input
                    label="Professor"
                    placeholder="Digite o nome"
                    name="professor"
                    value={formData.professor}
                    onChange={handleChange}
                  />

                  <Form.Input
                    label="Disciplina"
                    placeholder="Ex: Redes de Computadores"
                    name="disciplina"
                    value={formData.disciplina}
                    onChange={handleChange}
                  />

                  <Form.Group widths="equal">

                    <Form.Input
                      type="date"
                      label="Data"
                      name="data"
                      value={formData.data}
                      onChange={handleChange}
                    />

                    <Form.Input
                      type="time"
                      label="Hora Inicial"
                      name="horaInicial"
                      value={formData.horaInicial}
                      onChange={handleChange}
                    />

                    <Form.Input
                      type="time"
                      label="Hora Final"
                      name="horaFinal"
                      value={formData.horaFinal}
                      onChange={handleChange}
                    />

                  </Form.Group>

                  <Form.Input
                    label="Sala / Laboratório"
                    placeholder="Ex: Lab 07"
                    name="sala"
                    value={formData.sala}
                    onChange={handleChange}
                  />

                  <Form.TextArea
                    label="Observações"
                    placeholder="Informações adicionais..."
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                  />

                </Form>

              </Modal.Content>

              <Modal.Actions>

                <Button onClick={() => setOpen(false)}>
                  Cancelar
                </Button>

                <Button
                  color="green"
                  onClick={salvarReserva}
                >
                  <Icon name="check" />
                  Salvar Reserva
                </Button>

              </Modal.Actions>

            </Modal>

            {/* LISTA DE CARDS */}
            <Grid
              style={{ marginTop: "30px" }}
              columns={3}
            >
              <Grid.Row>

                {reservas.map((reserva, index) => (

                  <Grid.Column key={index}>

                    <Card fluid>

                      <Card.Content>

                        <Image
                          floated="left"
                          size="mini"
                          circular
                          src="https://pt.quizur.com/_image?href=https%3A%2F%2Fdev-beta.quizur.com%2Fstorage%2Fv1%2Fobject%2Fpublic%2F%2Fimagens%2F%2F20198516%2F08325843-82e4-44f2-a384-543616a37539.png&w=400&h=400&f=webp"
                        />

                        <Card.Header style={{ marginTop: "10px" }}>
                          {reserva.professor}
                        </Card.Header>

                        <Card.Meta style={{ marginTop: "10px" }}>
                          {reserva.disciplina}
                        </Card.Meta>

                        <Card.Description style={{ marginTop: "10px" }}>
                          {new Date(reserva.data).toLocaleDateString("pt-BR", 
                          {weekday: "long", day: "2-digit", month: "2-digit", year: "numeric"})}
                      <br />
                      <br />
                          {reserva.horaInicial} - {reserva.horaFinal}
                      <br />{reserva.sala}
                      <br />
                      <br />{reserva.observacoes}
                      </Card.Description>

                      </Card.Content>

                      <Card.Content extra>

                        <Button
                          size="small"
                          color="blue"
                          floated="left"
                          onClick={() => editarReserva(index)}
                        >
                          <Icon name="edit" />
                          Editar
                        </Button>

                        <Button
                          size="small"
                          color="red"
                          floated="right"
                          onClick={() => excluirReserva(index)}
                        >
                          <Icon name="trash" />
                          Excluir
                        </Button>

                      </Card.Content>

                    </Card>

                  </Grid.Column>

                ))}

              </Grid.Row>
            </Grid>

          </Container>

        </div>
      </div>
    </div>
  );
}