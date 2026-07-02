import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Icon, Divider } from "semantic-ui-react";
import { registerSuccessfulLoginForJwt } from "../util/AuthenticationService";
import { notifyError } from "../util/Util";

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
  <div className="container-cadastro">
    <div className="card-formulario" style={{ maxWidth: "480px" }}>
      
      {/* CABEÇALHO DO LOGIN */}
      <h2 className="titulo-form" style={{ textAlign: "center", marginBottom: "1.5em", fontSize: "2.2em" }}>
        Log-in Docente
      </h2>

      <Divider />
      <Form className="formulario-padrao" size="large" style={{ textAlign: "left" }}>
        
        <Form.Field style={{ marginBottom: "2em" }}>
          <label style={{ fontSize: "15px", marginBottom: "8px" }}>E-mail institucional:*</label>
          <Form.Input
            fluid
            required
            type="text"
            placeholder="Digite seu E-mail"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Field>

        <Form.Field style={{ marginBottom: "2.5em" }}>
          <label style={{ fontSize: "15px", marginBottom: "8px" }}>Senha:*</label>
          <Form.Input
            fluid
            required
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </Form.Field>

        {/* BOTÃO PRINCIPAL DE ENTRAR */}
        <Button
          fluid
          className="btn-salvar-form"
          type="button"
          onClick={entrar}
          style={{ marginBottom: "20px" }}
        >
          <Icon name="sign in" />
          Entrar
        </Button>

        <Divider horizontal style={{ margin: "20px 0", color: "#999", fontSize: "12px" }}>OU</Divider>

        {/* ÁREA DE LINKS SECUNDÁRIOS PADRONIZADOS E CENTRALIZADOS */}
        <div className="grupo-botoes-form" style={{ gap: "10px", marginTop: "10px" }}>
          <Button
            fluid
            basic
            color="green"
            style={{ borderRadius: "10px", padding: "12px", fontWeight: "600" }}
            as={Link}
            to="/cadastro-professor"
          >
            <Icon name="user plus" />
            Primeiro acesso? Cadastre-se
          </Button>

          <Button
            fluid
            color="blue"
            as={Link}
            to="/login-adm"
          >
            <Icon name="shield" />
            Login Administrador
          </Button>
        </div>

      </Form>
    </div>
  </div>
);

};

export default LoginProfessor;
