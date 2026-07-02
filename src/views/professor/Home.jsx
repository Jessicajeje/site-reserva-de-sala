import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Divider,
  Grid,
  Header,
  Select,
  Segment,
  Icon,
  Modal,
} from "semantic-ui-react";

import Navbar from "../../Components/navbar/NavbarProfessor";

export default function Home() {
  const [reposicoes, setReposicoes] = useState([]);

  useEffect(() => {
    const idProfessor = localStorage.getItem("idProfessor");

    axios.get("http://localhost:8080/api/reposicao").then((res) => {
      const minhasReposicoes = res.data.filter(
        (r) => r.professor?.id === Number(idProfessor),
      );

      setReposicoes(minhasReposicoes);
    });
  }, []);

  const [openConfirmarModal, setOpenConfirmarModal] = useState(false);
  const [openCancelarModal, setOpenCancelarModal] = useState(false);

  const [reposicaoSelecionada, setReposicaoSelecionada] = useState(null);

  const [turmaFiltro, setTurmaFiltro] = useState("");
  const [disciplinaFiltro, setDisciplinaFiltro] = useState("");
  const [salaFiltro, setSalaFiltro] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");

  const opcoesTurmaFiltro = useMemo(
    () => [
      ...new Map(
        reposicoes
          .filter(r => r.turma)
          .map(r => [
            r.turma.id,
            {
              key: r.turma.id,
              value: r.turma.id,
              text: r.turma.nome,
            },
          ])
      ).values(),
    ],
    [reposicoes]
  );

  const opcoesDisciplinaFiltro = useMemo(
    () => [
      ...new Map(
        reposicoes
          .filter(
            r =>
              r.disciplina &&
              (!turmaFiltro || r.turma?.id === Number(turmaFiltro))
          )
          .map(r => [
            r.disciplina.id,
            {
              key: r.disciplina.id,
              value: r.disciplina.id,
              text: r.disciplina.nome,
            },
          ])
      ).values(),
    ],
    [reposicoes, turmaFiltro]
  );

  const opcoesSalaFiltro = useMemo(
    () => [
      ...new Map(
        reposicoes
          .filter(r => r.sala)
          .map(r => [
            r.sala.id,
            {
              key: r.sala.id,
              value: r.sala.id,
              text: `${r.sala.tipo === "laboratorio" ? "Laboratório" : "Sala"} ${r.sala.numero}`,
            },
          ])
      ).values(),
    ],
    [reposicoes]
  );

  const opcoesStatusFiltro = [
    {
      key: "PENDENTE",
      value: "PENDENTE",
      text: "Pendente",
    },
    {
      key: "CONCLUIDA",
      value: "CONCLUIDA",
      text: "Concluída",
    },
  ];

  const filtrosAtivos = !!(
    turmaFiltro ||
    disciplinaFiltro ||
    salaFiltro ||
    statusFiltro
  );

  const limparFiltros = () => {
    setTurmaFiltro("");
    setDisciplinaFiltro("");
    setSalaFiltro("");
    setStatusFiltro("");
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
      dataReposicao: formatarData(reposicao.dataReposicao),
      dataAulaOriginal: formatarData(reposicao.dataAulaOriginal),
      horarioInicio: normalizarHora(reposicao.horarioInicio),
      horarioFim: normalizarHora(reposicao.horarioFim),
      statusReposicao: "CONCLUIDA",
    };

    axios
      .put(`http://localhost:8080/api/reposicao/${reposicao.id}`, payload)
      .then(() => {
        setReposicoes((antigas) =>
          antigas.map((r) =>
            r.id === reposicao.id
              ? {
                ...r,
                statusReposicao: "CONCLUIDA",
              }
              : r,
          ),
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
      .delete(`http://localhost:8080/api/reposicao/${reposicaoSelecionada.id}`)
      .then(() => {
        setReposicoes((antigas) =>
          antigas.filter((r) => r.id !== reposicaoSelecionada.id),
        );

        setOpenCancelarModal(false);

        setReposicaoSelecionada(null);
      });
  }

  const reposicoesFiltradasOrdenadas = [...reposicoes]
    .filter((r) => {
      const turmaOk =
        !turmaFiltro || r.turma?.id === Number(turmaFiltro);

      const disciplinaOk =
        !disciplinaFiltro || r.disciplina?.id === Number(disciplinaFiltro);

      const salaOk =
        !salaFiltro || r.sala?.id === Number(salaFiltro);

      const statusOk =
        !statusFiltro || r.statusReposicao === statusFiltro;

      return turmaOk && disciplinaOk && salaOk && statusOk;
    })
    .sort((a, b) => {
      // Pendentes primeiro
      if (a.statusReposicao !== b.statusReposicao) {
        return a.statusReposicao === "PENDENTE" ? -1 : 1;
      }

      // Mais recente primeiro
      return new Date(b.dataReposicao) - new Date(a.dataReposicao);
    });

  const formatarData = (data) => {
    if (!data) return "";

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Navbar tela={"home"} />

      <div style={{ display: "flex" }}>
        {/* CONTEÚDO */}
        <div style={{ flex: 1, padding: "30px" }}>
          {/* Removido o Container fluid que gerava o bloco branco de fundo */}
          <div style={{ background: "transparent", padding: 0 }}>
            <Header as="h1" style={{ margin: 0 }}>
              Início - Meus agendamentos
            </Header>

            <Divider />

            <Button
              color="green"
              icon
              labelPosition="left"
              as={Link}
              to="/reposicao"
              style={{ marginBottom: "4%", marginTop: "1%" }}
            >
              <Icon name="plus" />
              Agendar reposição
            </Button>
          </div>

          <Segment
            secondary
            style={{
              marginBottom: "1.2em",
              borderRadius: "10px",
              padding: "14px 18px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "38px",
                }}
              >
                <Icon name="filter" color="green" size="large" style={{ margin: 0 }} />
              </div>

              <div style={{ flex: "1 1 160px", minWidth: "160px" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "grey", marginBottom: "4px" }}>
                  TURMA
                </div>
                <Select
                  fluid
                  clearable
                  search
                  selection
                  placeholder="Todas"
                  options={opcoesTurmaFiltro}
                  value={turmaFiltro}
                  onChange={(e, { value }) => {
                    setTurmaFiltro(value);
                    setDisciplinaFiltro("");
                  }}
                />
              </div>

              <div style={{ flex: "1 1 160px", minWidth: "160px" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "grey", marginBottom: "4px" }}>
                  DISCIPLINA
                </div>
                <Select
                  fluid
                  clearable
                  search
                  selection
                  placeholder="Todas"
                  options={opcoesDisciplinaFiltro}
                  value={disciplinaFiltro}
                  onChange={(e, { value }) => setDisciplinaFiltro(value)}
                />
              </div>

              <div style={{ flex: "1 1 160px", minWidth: "160px" }}>
                <div style={{ fontSize: "11px", fontWeight: "bold", color: "grey", marginBottom: "4px" }}>
                  SALA
                </div>
                <Select
                  fluid
                  clearable
                  search
                  selection
                  placeholder="Todas"
                  options={opcoesSalaFiltro}
                  value={salaFiltro}
                  onChange={(e, { value }) => setSalaFiltro(value)}
                />
              </div>

              <div style={{ flex: "1 1 160px", minWidth: "160px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "grey",
                    marginBottom: "4px",
                  }}
                >
                  STATUS
                </div>

                <Select
                  fluid
                  clearable
                  selection
                  placeholder="Todos"
                  options={opcoesStatusFiltro}
                  value={statusFiltro}
                  onChange={(e, { value }) => setStatusFiltro(value)}
                />
              </div>

              <div style={{ flex: "0 0 auto" }}>
                <Button
                  basic
                  color="grey"
                  size="small"
                  disabled={!filtrosAtivos}
                  onClick={limparFiltros}
                >
                  <Icon name="close" />
                  Limpar
                </Button>
              </div>
            </div>
          </Segment>

          <Grid stackable style={{ marginTop: "20px" }}>
            {reposicoesFiltradasOrdenadas.map((r) => (
              <Grid.Column
                key={r.id}
                computer={5}
                tablet={8}
                mobile={16}
              >
                <Card fluid>
                  <Card.Content>
                    <Card.Header>{r.disciplina?.nome}</Card.Header>

                    <Card.Meta>{r.dataReposicao}</Card.Meta>

                    <Card.Description>
                      <p>
                        <b>Turma:</b> {r.turma?.nome}
                      </p>

                      <p>
                        <b>
                          {r.sala?.tipo === "laboratorio" ? "Lab" : "Sala"}:
                        </b>{" "}
                        {r.sala?.numero}
                      </p>

                      <p>
                        <b>Horário:</b> {r.horarioInicio}
                        {" - "}
                        {r.horarioFim}
                      </p>
                    </Card.Description>
                  </Card.Content>

                  <Card.Content extra>
                    {r.statusReposicao === "PENDENTE" ? (
                      <>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "10px",
                            width: "100%",
                          }}
                        >
                          <Button
                            color="green"
                            fluid
                            style={{ margin: 0 }}
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
                            style={{ margin: 0 }}
                            onClick={() => {
                              setReposicaoSelecionada(r);
                              setOpenCancelarModal(true);
                            }}
                          >
                            Cancelar Reposição
                          </Button>
                        </div>
                      </>
                    ) : (
                      <Button fluid color="green" disabled>
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
        <Modal.Header>Confirmar aula ministrada</Modal.Header>

        <Modal.Content>
          <p>Tem certeza que deseja marcar esta reposição como concluída?</p>
        </Modal.Content>

        <Modal.Actions>
          <Button onClick={() => setOpenConfirmarModal(false)}>Cancelar</Button>

          <Button color="green" onClick={confirmarConclusao}>
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
        <Modal.Header>Cancelar reposição</Modal.Header>

        <Modal.Content>
          <p>Tem certeza que deseja cancelar esta reposição?</p>
        </Modal.Content>

        <Modal.Actions>
          <Button onClick={() => setOpenCancelarModal(false)}>Voltar</Button>

          <Button negative onClick={confirmarCancelamento}>
            Cancelar Reposição
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
}
