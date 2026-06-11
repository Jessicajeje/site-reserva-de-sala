import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Grid, Header, Segment } from "semantic-ui-react";
import { registerSuccessfulLoginForJwt } from "../util/AuthenticationService";
import { notifyError } from "../util/Util";
import "./estilo.css";

const LoginProfessor = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");

  function entrar() {
    if (username !== "" && senha !== "") {
      let authenticationRequest = {
        username: username,
        password: senha,
      };

      axios
        .post("http://localhost:8080/api/auth", authenticationRequest)
        .then((response) => {
          registerSuccessfulLoginForJwt(
            response.data.token,
            response.data.tokenExpiresIn,
          );
          localStorage.setItem("idProfessor", response.data.id);
          localStorage.setItem("username", response.data.username);

          navigate("/home");
        })
        .catch((error) => {
          notifyError("Usuário não encontrado");
        });
    }
  }
  return (
    <Grid
      textAlign="center"
      style={{ height: "100vh", backgroundColor: "#f4f4f4" }}
      verticalAlign="middle"
    >
      <Grid.Column style={{ maxWidth: 500 }}>
        <Segment raised style={{ padding: "3em" }}>
          <Header
            as="h1"
            textAlign="center"
            style={{ marginBottom: "1.5em", fontSize: "2em" }}
          >
            Log-in Docente
          </Header>

          <Form size="large">
            <Form.Field style={{ marginBottom: "10%", textAlign: "left" }}>
              <label style={{ fontSize: "16px", marginBottom: "10px" }}>
                E-mail institucional:
              </label>
              <Form.Input
                fluid
                required
                type="text"
                placeholder="Digite seu E-mail:"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Field>
            <Form.Field style={{ marginBottom: "15%", textAlign: "left" }}>
              <label style={{ fontSize: "16px", marginBottom: "10px" }}>
                Senha:*
              </label>
              <Form.Input
                fluid
                required
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </Form.Field>

            <Button
              fluid
              size="huge"
              style={{
                backgroundColor: "#21ba45",
                color: "#fff",
                padding: "15px",
                marginBottom: "8%",
              }}
              onClick={entrar}
            >
              Entrar
            </Button>
          </Form>
          <Link to={"/cadastro-professor"}>
            {" "}
            <p style={{ marginBottom: "3%" }}>Primeiro acesso? Cadastre-se</p>
          </Link>
          <Link to={"/login-adm"}>
            {" "}
            <p>Login administrador</p>
          </Link>
        </Segment>
      </Grid.Column>
    </Grid>
  );
};

export default LoginProfessor;
