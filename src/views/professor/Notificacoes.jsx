import React, { useState } from "react";
import {
  Container,
  Divider,
  Header,
  Icon,
  Segment
} from "semantic-ui-react";

import Navbar from "../../Components/navbar/NavbarProfessor";

export default function Notificacoes() {

  // Controle do sino
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);

  // Histórico de notificações
  const [notificacoes, setNotificacoes] = useState([
    {
      id: 1,
      titulo: "Reserva confirmada",
      descricao: "Sua reserva no Lab 07 foi aprovada.",
      favorita: false
    },
    {
      id: 2,
      titulo: "Reposição de aula",
      descricao: "Nova solicitação de reposição cadastrada.",
      favorita: true
    }
  ]);

  // Favoritar
  function toggleFavorita(id) {
    const novaLista = notificacoes.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          favorita: !item.favorita
        };
      }

      return item;
    });

    setNotificacoes(novaLista);
  }

  // Excluir
  function excluirNotificacao(id) {
    const novaLista = notificacoes.filter(
      (item) => item.id !== id
    );

    setNotificacoes(novaLista);
  }

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

      <Navbar tela={"notificacoes"} />

      <div style={{ display: "flex" }}>

        {/* Espaço lateral */}
        <div
          style={{
            width: "220px",
            backgroundColor: "#fff",
            minHeight: "100vh",
            borderRight: "1px solid #ddd"
          }}
        />

        {/* Conteúdo */}
        <div style={{ flex: 1, padding: "40px 50px" }}>
          <Container fluid>

            {/* Título */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <Header
                as="h2"
                style={{
                  marginBottom: "10px",
                  fontWeight: "600"
                }}
              >
                Notificações
              </Header>

              {/* Sino */}
              <Icon
                name={
                  notificacoesAtivas
                    ? "bell outline"
                    : "bell slash outline"
                }
                size="large"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setNotificacoesAtivas(!notificacoesAtivas)
                }
              />
            </div>

            <Divider style={{ marginBottom: "30px" }} />

            {/* Histórico */}
            {notificacoes.length === 0 ? (
              <p style={{ color: "#777" }}>
                Nenhuma notificação encontrada.
              </p>
            ) : (
              notificacoes.map((item) => (
                <Segment
                  key={item.id}
                  style={{
                    marginBottom: "20px",
                    borderRadius: "10px"
                  }}
                >

                  {/* Título */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <Header as="h4" style={{ margin: 0 }}>
                      {item.titulo}
                    </Header>

                    {/* Botões */}
                    <div>

                      {/* Favoritar */}
                      <Icon
                        name={
                          item.favorita
                            ? "star"
                            : "star outline"
                        }
                        size="large"
                        style={{
                          cursor: "pointer",
                          marginRight: "15px"
                        }}
                        onClick={() =>
                          toggleFavorita(item.id)
                        }
                      />

                      {/* Excluir */}
                      <Icon
                        name="trash alternate outline"
                        size="large"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          excluirNotificacao(item.id)
                        }
                      />

                    </div>
                  </div>

                  {/* Texto */}
                  <p
                    style={{
                      marginTop: "10px",
                      color: "#666"
                    }}
                  >
                    {item.descricao}
                  </p>

                </Segment>
              ))
            )}

          </Container>
        </div>
      </div>
    </div>
  );
}