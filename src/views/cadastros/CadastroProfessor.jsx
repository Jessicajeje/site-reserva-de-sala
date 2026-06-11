import axios from "axios";
import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Form, Grid, Header, Icon, Segment } from "semantic-ui-react";
import { notifyError, notifySuccess } from "../../views/util/Util";
import {Link} from 'react-router-dom';
import "../logins/estilo.css";

export default function CadastroProfessor() {
  const { state } = useLocation();

  const [idProfessor, setIdProfessor] = useState();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState();
  const [siape, setSiape] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmarSenha, setConfirmarSenha] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    if (state != null && state.id != null) {
      axios
        .get("http://localhost:8080/api/professor/" + state.id)
        .then((response) => {
          setIdProfessor(response.data.id);
          setCpf(response.data.cpf);
          setNome(response.data.nome);
          setSiape(response.data.siape);
          setEmail(response.data.email);
          setPassword(response.data.password);
          setConfirmarSenha(response.data.password);
        });
    }
  }, [state]);

  function salvar() {
    if (!nome || !email || !siape || !cpf) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!idProfessor) {
      if (!password || !confirmarSenha) {
        alert("A password é obrigatória para novos cadastros.");
        return;
      }
    }

    if (password && password !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    const professorRequest = {
      nome: nome,
      cpf: cpf,
      email: email,
      siape: siape,
      password: password ? password : null,
      ativo: false,
    };

    if (idProfessor != null) {
      axios
        .put(
          "http://localhost:8080/api/professor/" + idProfessor,
          professorRequest
        )
        .then(() => {
          notifySuccess("Professor alterado com sucesso.");
          setTimeout(() => navigate("/professores-ativos"), 1000);
        })
        .catch((error) => {
          console.error(error);

          if (error.response.data.errors !== undefined) {
            for (let i = 0; i < error.response.data.errors.length; i++) {
              notifyError(error.response.data.errors[i].defaultMessage);
            }
          } else {
            notifyError(error.response.data.message);
          }
        });
    } else {
      axios
        .post("http://localhost:8080/api/professor", professorRequest)
        .then(() => {
          notifySuccess(
            "Cadastrado com sucesso! Aguarde a validação da secretaria."
          );

          setTimeout(() => navigate("/"), 1000);
        })
        .catch((error) => {
          console.error(error);

          if (error.response.data.errors !== undefined) {
            for (let i = 0; i < error.response.data.errors.length; i++) {
              notifyError(error.response.data.errors[i].defaultMessage);
            }
          } else {
            notifyError(error.response.data.message);
          }
        });
    }
  }

  return (
    <Grid
      textAlign="center"
      style={{ height: "100vh", backgroundColor: "#f4f4f4" }}
      verticalAlign="middle"
    >
      <Grid.Column style={{ maxWidth: 600 }}>
        <Segment raised style={{ padding: "3em" }}>
          <Header as="h1" textAlign="center" style={{ marginBottom: "1.5em" }}>
            {idProfessor === undefined ? (
              <h2>
                <span style={{ color: "darkgray" }}>
                  Cadastro <Icon name="angle double right" size="small" />
                </span>{" "}
                Docente
              </h2>
            ) : (
              <h2>
                <span style={{ color: "darkgray" }}>
                  Alteração <Icon name="angle double right" size="small" />
                </span>{" "}
                Docente
              </h2>
            )}
          </Header>

          <Form size="large" style={{ textAlign: "left" }}>
            <Form.Group widths="equal">
              <Form.Input
                fluid
                label="Nome"
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />

              <Form.Field>
<label>CPF</label>
                <IMaskInput
                  mask="000.000.000-00"
                  value={cpf}
                  onAccept={(value) => setCpf(value)}
                  placeholder="000.000.000-00"
                  style={{
                    padding: "0.67857143em 1em",
                    border: "1px solid rgba(34,36,38,.15)",
                    borderRadius: ".28571429rem",
                    width: "100%",
                  }}
                />
              </Form.Field>
            </Form.Group>

            <Form.Group widths="equal">
              <Form.Field>
                  <label>Siape</label>
              <IMaskInput
              mask='00000000'
                fluid
                placeholder="Nº Siape"
                value={siape}
                onChange={(e) => setSiape(e.target.value)}
              />
</Form.Field>
              <Form.Input
                fluid
                label="Email"
                placeholder="Email institucional"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

            </Form.Group>

            <Form.Input
              fluid
              label="Senha"
              type="password"
              placeholder="Digite uma password"
              value={password}
              disabled={!!idProfessor}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Form.Input
              fluid
              label="Confirmar Senha"
              type="password"
              placeholder="Repita a password"
              value={confirmarSenha}
              disabled={!!idProfessor}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              error={
                confirmarSenha !== "" && password !== confirmarSenha
                  ? { content: "As senhas não coincidem", pointing: "below" }
                  : false
              }
            />

            <Button
              fluid
              size="huge"
              type="button"
              style={{
                backgroundColor: "#21ba45",
                color: "#fff",
                marginTop: "1em",
                marginBottom:'8%'
              }}
              onClick={salvar}
            >
              Concluir
            </Button>
          </Form>
          <Link to={'/'}> <p>voltar para log-in docente</p></Link>
        </Segment>
      </Grid.Column>
    </Grid>
  );
}