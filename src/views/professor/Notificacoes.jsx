import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Container,
  Divider,
  Header,
  Icon,
  Segment,
  Label,
  Loader,
} from "semantic-ui-react";

import Navbar from "../../Components/navbar/NavbarProfessor";

export default function Notificacoes() {

  const [notificacoesAtivas, setNotificacoesAtivas] =
    useState(true);

  const [loading, setLoading] = useState(true);

  const [notificacoes, setNotificacoes] =
    useState([]);

  const professorId =
    localStorage.getItem("professorId") || 1;

  useEffect(() => {
    carregarNotificacoes();
  }, []);

  function carregarNotificacoes() {

    axios
      .get(
        `http://localhost:8080/api/notificacao/professor/${professorId}`
      )
      .then((response) => {

        setNotificacoes(response.data);

      })
      .catch((error) => {

        console.error(
          "Erro ao carregar notificações",
          error
        );

      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function favoritar(id) {

    try {

      await axios.put(
        `http://localhost:8080/api/notificacao/${id}/favoritar`
      );

      carregarNotificacoes();

    } catch (error) {

      console.error(error);

    }
  }

  async function excluir(id) {

    try {

      await axios.delete(
        `http://localhost:8080/api/notificacao/${id}`
      );

      carregarNotificacoes();

    } catch (error) {

      console.error(error);

    }
  }

  async function marcarComoLida(id) {

    try {

      await axios.put(
        `http://localhost:8080/api/notificacao/${id}/lida`
      );

      carregarNotificacoes();

    } catch (error) {

      console.error(error);

    }
  }

  return (
    <div
      style={{
        backgroundColor: "#fff",
        minHeight: "100vh",
      }}
    >
      <Navbar tela={"notificacoes"} />

      <div style={{ display: "flex" }}>

        <div
          style={{
            width: "220px",
            minHeight: "100vh",
          }}
        />

        <div
          style={{
            flex: 1,
            padding: "40px 60px",
          }}
        >
          <Container fluid>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Header as="h2">
                Notificações
              </Header>

              <Icon
                name={
                  notificacoesAtivas
                    ? "bell"
                    : "bell slash"
                }
                size="large"
                style={{
                  cursor: "pointer",
                }}
                onClick={() =>
                  setNotificacoesAtivas(
                    !notificacoesAtivas
                  )
                }
              />
            </div>

            <Divider />

            {!notificacoesAtivas && (

              <Segment color="red">
                As notificações estão
                desativadas.
              </Segment>

            )}

            {loading ? (

              <Loader
                active
                inline="centered"
              />

            ) : notificacoes.length === 0 ? (

              <Segment placeholder>

                <Header icon>
                  <Icon name="bell outline" />
                  Nenhuma notificação encontrada.
                </Header>

              </Segment>

            ) : (

              notificacoes.map((item) => (

                <Segment
                  key={item.id}
                  style={{
                    borderRadius: "10px",
                    marginBottom: "20px",
                    backgroundColor: item.lida
                      ? "#f9f9f9"
                      : "#ffffff"
                  }}
                >

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                    }}
                  >
                    <div>

                      <Header
                        as="h4"
                        style={{
                          marginBottom:
                            "5px",
                        }}
                      >
                        {item.titulo}
                      </Header>

                      <p
                        style={{
                          color: "#666",
                        }}
                      >
                        {item.descricao}
                      </p>

                      <div
                        style={{
                          marginTop:
                            "10px",
                        }}
                      >

                        {item.lida ? (

                          <Label color="green">
                            Lida
                          </Label>

                        ) : (

                          <Label color="orange">
                            Não Lida
                          </Label>

                        )}

                        {item.favorita && (

                          <Label
                            color="yellow"
                            style={{
                              marginLeft:
                                "10px",
                            }}
                          >
                            Favorita
                          </Label>

                        )}

                      </div>

                    </div>

                    <div>

                      {!item.lida && (

                        <Icon
                          name="check circle"
                          size="large"
                          color="green"
                          style={{
                            cursor:
                              "pointer",
                            marginRight:
                              "15px",
                          }}
                          title="Marcar como lida"
                          onClick={() =>
                            marcarComoLida(
                              item.id
                            )
                          }
                        />

                      )}

                      <Icon
                        name={
                          item.favorita
                            ? "star"
                            : "star outline"
                        }
                        size="large"
                        color="yellow"
                        style={{
                          cursor:
                            "pointer",
                          marginRight:
                            "15px",
                        }}
                        title="Favoritar"
                        onClick={() =>
                          favoritar(
                            item.id
                          )
                        }
                      />

                      <Icon
                        name="trash"
                        size="large"
                        color="red"
                        style={{
                          cursor:
                            "pointer",
                        }}
                        title="Excluir"
                        onClick={() =>
                          excluir(
                            item.id
                          )
                        }
                      />

                    </div>
                  </div>
                </Segment>

              ))

            )}

          </Container>
        </div>
      </div>
    </div>
  );
}
