import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask";
import { useLocation } from "react-router-dom";
import { Button, Form, Grid, Header, Icon, Segment } from "semantic-ui-react";
import { notifyError, notifySuccess } from "../../views/util/Util";
import "../logins/estilo.css";

export default function CadastroProfessor() {
  const { state } = useLocation();

  const perfilUsuario = "ADM";
  const isAdmin = perfilUsuario === "PROF";

  const [idProfessor, setIdProfessor] = useState();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [siape, setSiape] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [disciplinas, setDisciplinas] = useState([]);
  const [opcoesDisciplinas, setOpcoesDisciplinas] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/disciplina")
      .then((response) => {
        const formatadas = response.data.map((d) => ({
          key: d.id,
          text: d.nome,
          value: d.id,
        }));
        setOpcoesDisciplinas(formatadas);
      })
      .catch(() => {
        notifyError("Erro ao carregar lista de disciplinas.");
      });
  }, []);

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

        const listaSemeada = response.data.disciplinas || [];
        setDisciplinas(listaSemeada.map((d) => d.id));

        setSenha(response.data.senha);
        setConfirmarSenha(response.data.senha);
      });
  }
}, [state]);

  function salvar() {
    if (!nome || !email || !siape || !cpf) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!idProfessor) {
      if (!senha || !confirmarSenha) {
        alert("A senha é obrigatória para novos cadastros.");
        return;
      }
    }

    if (senha && senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    const professorRequest = {
      nome: nome,
      cpf: cpf,
      email: email,
      siape: siape,
      senha: senha ? senha : null,
      disciplinas: disciplinas,
    };

    if (idProfessor != null) {
      axios
        .put(
          "http://localhost:8080/api/professor/" + idProfessor,
          professorRequest,
        )
        .then(() => {
          notifySuccess("Professor alterado com sucesso.");
          setTimeout(() => navigate("/professores-ativos"), 1000);
        })
        .catch(() => notifyError("Erro ao alterar o professor."));
    } else {
      axios
        .post("http://localhost:8080/api/professor", professorRequest)
        .then(() => {
          notifySuccess(
            "Cadastrado com sucesso! Aguarde a validação da secretaria.",
          );
          setTimeout(() => navigate("/"), 1000);
        })
        .catch(() => notifyError("Erro ao incluir o professor."));
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
                placeholder="Nome completo"
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
              <Form.Input
                fluid
                label="Siape"
                placeholder="Nº Siape"
                value={siape}
                onChange={(e) => setSiape(e.target.value)}
              />
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
              placeholder="Digite uma senha"
              value={senha}
              disabled={!!idProfessor}
              onChange={(e) => setSenha(e.target.value)}
            />

            <Form.Input
              fluid
              label="Confirmar Senha"
              type="password"
              placeholder="Repita a senha"
              value={confirmarSenha}
              disabled={!!idProfessor}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              error={
                confirmarSenha !== "" && senha !== confirmarSenha
                  ? { content: "As senhas não coincidem", pointing: "below" }
                  : false
              }
            />

            <Form.Field style={{ marginBottom: "2em" }}>
              <label>Disciplinas que leciona</label>
              <Form.Select
                fluid
                multiple
                search
                selection
                options={opcoesDisciplinas}
                placeholder="Selecione as disciplinas"
                value={disciplinas}
                noResultsMessage="Nenhuma disciplina encontrada."
                disabled={!isAdmin} // Se NÃO for admin, o campo fica cinza e travado
                onChange={(e, { value }) => setDisciplinas(value)}
              />
            </Form.Field>

            <Button
              fluid
              size="huge"
              type="button"
              style={{
                backgroundColor: "#21ba45",
                color: "#fff",
                marginTop: "1em",
              }}
              onClick={salvar}
            >
              Concluir
            </Button>
          </Form>
        </Segment>
      </Grid.Column>
    </Grid>
  );
}
