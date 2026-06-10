import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Container,
  Grid,
  Header,
  Divider,
  Image,
  Icon,
  Button
} from "semantic-ui-react";

import Navbar from "../../Components/navbar/NavbarProfessor";

export default function Perfil() {

  const professorId = 1;

  const [professor, setProfessor] = useState({
    nome: "",
    email: "",
    siape: "",
    cpf: "",
    senha: ""
  });

  const [editando, setEditando] = useState({
    nome: false,
    email: false,
    siape: false,
    cpf: false,
    senha: false
  });

  const [fotoPerfil, setFotoPerfil] = useState(
    "https://react.semantic-ui.com/images/avatar/large/elliot.jpg"
  );

  useEffect(() => {
    buscarProfessor();
  }, []);

  async function buscarProfessor() {
    try {

      const response = await axios.get(
        `http://localhost:8080/api/professor/${professorId}`
      );

      setProfessor(response.data);

    } catch (error) {

      console.error(error);

    }
  }

  function handleChange(event) {

    setProfessor({
      ...professor,
      [event.target.name]: event.target.value
    });

  }

  async function salvarAlteracoes() {

    try {

      await axios.put(
        `http://localhost:8080/api/professor/${professorId}`,
        professor
      );

      alert("Perfil atualizado com sucesso!");

    } catch (error) {

      console.error(error);
      alert("Erro ao atualizar perfil.");

    }
  }

  function alterarFoto(event) {

    const arquivo = event.target.files[0];

    if (arquivo) {

      const url = URL.createObjectURL(arquivo);
      setFotoPerfil(url);

    }
  }

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        minHeight: "100vh"
      }}
    >
      <Navbar tela={"perfil"} />

      <div style={{ display: "flex" }}>

        <div
          style={{
            width: "220px"
          }}
        />

        <div
          style={{
            flex: 1,
            padding: "30px 50px"
          }}
        >

          <Container fluid>

            <Header
              as="h1"
              style={{
                fontSize: "32px",
                fontWeight: "600"
              }}
            >
              Perfil
            </Header>

            <Divider />

            <Grid>

              {/* FOTO */}
              <Grid.Column width={4}>

                <div
                  style={{
                    textAlign: "center"
                  }}
                >

                  <div
                    style={{
                      position: "relative",
                      display: "inline-block"
                    }}
                  >

                    <Image
                      src={fotoPerfil}
                      circular
                      size="small"
                      style={{
                        border: "3px solid #5DA348"
                      }}
                    />

                    <label
                      htmlFor="foto"
                      style={{
                        position: "absolute",
                        bottom: "5px",
                        right: "5px",
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#5DA348",
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer"
                      }}
                    >
                      <Icon
                        name="camera"
                        color="black"
                      />
                    </label>

                    <input
                      id="foto"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={alterarFoto}
                    />

                  </div>

                </div>

              </Grid.Column>

              {/* DADOS */}
              <Grid.Column width={12}>

                <CampoPerfil
                  titulo="Nome"
                  campo="nome"
                  professor={professor}
                  editando={editando}
                  setEditando={setEditando}
                  handleChange={handleChange}
                />

                <CampoPerfil
                  titulo="Email"
                  campo="email"
                  professor={professor}
                  editando={editando}
                  setEditando={setEditando}
                  handleChange={handleChange}
                />

                <CampoPerfil
                  titulo="SIAPE"
                  campo="siape"
                  professor={professor}
                  editando={editando}
                  setEditando={setEditando}
                  handleChange={handleChange}
                />

                <CampoPerfil
                  titulo="CPF"
                  campo="cpf"
                  professor={professor}
                  editando={editando}
                  setEditando={setEditando}
                  handleChange={handleChange}
                />

                <CampoPerfil
                  titulo="Senha"
                  campo="senha"
                  professor={professor}
                  editando={editando}
                  setEditando={setEditando}
                  handleChange={handleChange}
                  password
                />

                <Button
                  color="green"
                  size="large"
                  icon
                  labelPosition="left"
                  onClick={salvarAlteracoes}
                  style={{
                    marginTop: "20px"
                  }}
                >
                  <Icon name="save" />
                  Salvar Alterações
                </Button>

              </Grid.Column>

            </Grid>

          </Container>

        </div>

      </div>
    </div>
  );
}

function CampoPerfil({
  titulo,
  campo,
  professor,
  editando,
  setEditando,
  handleChange,
  password = false
}) {

  return (

    <div
      style={{
        marginBottom: "35px"
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #EAEAEA",
          paddingBottom: "15px"
        }}
      >

        <div style={{ flex: 1 }}>

          <div
            style={{
              fontSize: "14px",
              color: "#777",
              marginBottom: "8px",
              fontWeight: "600"
            }}
          >
            {titulo}
          </div>

          {editando[campo] ? (

            <input
              type={password ? "password" : "text"}
              name={campo}
              value={professor[campo]}
              onChange={handleChange}
              style={{
                width: "100%",
                maxWidth: "500px",
                padding: "10px",
                fontSize: "18px",
                border: "1px solid #ccc",
                borderRadius: "5px"
              }}
            />

          ) : (

            <div
              style={{
                fontSize: "22px",
                color: "#222",
                fontWeight: "500"
              }}
            >
              {password
                ? "********"
                : professor[campo]}
            </div>

          )}

        </div>

        <Button
          basic
          icon
          onClick={() =>
            setEditando({
              ...editando,
              [campo]: !editando[campo]
            })
          }
        >
          <Icon name="edit" />
        </Button>

      </div>

    </div>
  );
}
