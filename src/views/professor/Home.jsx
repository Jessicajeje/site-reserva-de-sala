import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Header,
  Icon,
  Modal
} from "semantic-ui-react";

import Navbar from "../../Components/navbar/NavbarProfessor";

export default function Home() {

  const [reposicoes, setReposicoes] = useState([]);

  useEffect(() => {

    const idProfessor =
      localStorage.getItem("idProfessor");

    axios
      .get("http://localhost:8080/api/reposicao")
      .then((res) => {

        const minhasReposicoes = res.data.filter(
          r => r.professor?.id === Number(idProfessor)
        );

        setReposicoes(minhasReposicoes);

      });

  }, []);

  const [openConfirmarModal, setOpenConfirmarModal] = useState(false);
  const [openCancelarModal, setOpenCancelarModal] = useState(false);

  const [reposicaoSelecionada, setReposicaoSelecionada] = useState(null);

  const formatarParaBR = (dataISO) => {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const normalizarHora = (hora) => {
    if (!hora) return "";

    // pega só HH:mm (remove segundos)
    return hora.length > 5 ? hora.slice(0, 5) : hora;
  };

  function concluirReposicao(reposicao) {

    const payload = {
      idTurma: reposicao.turma.id,
      idDisciplina: reposicao.disciplina.id,
      idProfessor: reposicao.professor.id,
      idSala: reposicao.sala.id,
      dataReposicao: formatarParaBR(reposicao.dataReposicao),
      dataAulaOriginal: formatarParaBR(reposicao.dataAulaOriginal),
      horarioInicio: normalizarHora(reposicao.horarioInicio),
      horarioFim: normalizarHora(reposicao.horarioFim),
      statusReposicao: "CONCLUIDA"
    };

    axios
      .put(
        `http://localhost:8080/api/reposicao/${reposicao.id}`,
        payload
      )
      .then(() => {

        setReposicoes((antigas) =>
          antigas.map((r) =>
            r.id === reposicao.id
              ? {
                ...r,
                statusReposicao: "CONCLUIDA"
              }
              : r
          )
        );

      });
  }

  function confirmarConclusao() {

    concluirReposicao(reposicaoSelecionada);

    setOpenConfirmarModal(false);

    setReposicaoSelecionada(null);

  }

  function confirmarCancelamento() {

    axios
      .delete(
        `http://localhost:8080/api/reposicao/${reposicaoSelecionada.id}`
      )
      .then(() => {

        setReposicoes((antigas) =>
          antigas.filter((r) => r.id !== reposicaoSelecionada.id)
        );

        setOpenCancelarModal(false);

        setReposicaoSelecionada(null);

      });

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

          <Grid stackable style={{ marginTop: "20px" }}>
            {reposicoes.map((r) => (
              <Grid.Column
                key={r.id}
                computer={5}
                tablet={8}
                mobile={16}
              >
                <Card fluid>

                  <Card.Content>

                    <Card.Header>
                      {r.disciplina?.nome}
                    </Card.Header>

                    <Card.Meta>
                      {r.dataReposicao}
                    </Card.Meta>

                    <Card.Description>

                      <p>
                        <b>Turma:</b> {r.turma?.nome}
                      </p>

                      <p>
                        <b>{r.sala?.tipo === "laboratorio" ? "Lab" : "Sala"}:</b>{" "}
                        {r.sala?.numero}
                      </p>

                      <p>
                        <b>Horário:</b>
                        {" "}
                        {r.horarioInicio}
                        {" - "}
                        {r.horarioFim}
                      </p>

                    </Card.Description>

                  </Card.Content>

                  <Card.Content extra>

                    {r.statusReposicao === "PENDENTE" ? (
                      <>
                        <Button
                          color="green"
                          fluid
                          onClick={() => {
                            setReposicaoSelecionada(r);
                            setOpenConfirmarModal(true);
                          }}
                        >
                          Confirmar Aula Ministrada
                        </Button>

                        <Button
                          color="red"
                          fluid
                          style={{ marginTop: "10px" }}
                          onClick={() => {
                            setReposicaoSelecionada(r);
                            setOpenCancelarModal(true);
                          }}
                        >
                          Cancelar Reposição
                        </Button>
                      </>
                    ) : (
                      <Button
                        fluid
                        color="green"
                        disabled
                      >
                        Concluída
                      </Button>
                    )}

                  </Card.Content>

                </Card>
              </Grid.Column>
            ))}
          </Grid>

        </div>
      </div>

      <Modal
        size="tiny"
        open={openConfirmarModal}
        onClose={() => setOpenConfirmarModal(false)}
        closeOnDimmerClick={false}
        closeOnEscape={false}
      >
        <Modal.Header>
          Confirmar aula ministrada
        </Modal.Header>

        <Modal.Content>
          <p>
            Tem certeza que deseja marcar esta reposição como concluída?
          </p>
        </Modal.Content>

        <Modal.Actions>
          <Button
            onClick={() => setOpenConfirmarModal(false)}
          >
            Cancelar
          </Button>

          <Button
            color="green"
            onClick={confirmarConclusao}
          >
            Confirmar
          </Button>
        </Modal.Actions>
      </Modal>

      <Modal
        size="tiny"
        open={openCancelarModal}
        onClose={() => setOpenCancelarModal(false)}
        closeOnDimmerClick={false}
        closeOnEscape={false}
      >
        <Modal.Header>
          Cancelar reposição
        </Modal.Header>

        <Modal.Content>
          <p>
            Tem certeza que deseja cancelar esta reposição?
          </p>
        </Modal.Content>

        <Modal.Actions>
          <Button
            onClick={() => setOpenCancelarModal(false)}
          >
            Voltar
          </Button>

          <Button
            negative
            onClick={confirmarCancelamento}
          >
            Cancelar Reposição
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
}