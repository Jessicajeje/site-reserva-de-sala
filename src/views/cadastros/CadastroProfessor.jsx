import { useEffect, useState } from "react";
import axios from "axios";
import { notifyError, notifySuccess } from '../../views/util/Util';
import { IMaskInput } from "react-imask";
import { Button, Form, Grid, Header, Segment } from "semantic-ui-react";

const CadastroProfessor = () => {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [siape, setSiape] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [disciplinas, setDisciplinas] = useState([]);

  const [opcoesDisciplinas, setOpcoesDisciplinas] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/disciplina")
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


  function salvar() {
    

  if (!nome || !email || !siape || !cpf || disciplinas.length === 0) {
    alert("Por favor, preencha todos os campos obrigatórios e selecione ao menos uma disciplina.");
    return;
  }

  else if (senha !== confirmarSenha) {
    alert("As senhas não coincidem!");
    return;
  }

   let professorRequest ={
    nome: nome,
    cpf:cpf,
    email:email,
    siape:siape,
    senha:senha,
    disciplinas:disciplinas
   }

     axios.post("http://localhost:8080/api/professor", professorRequest)
      .then((response) => {
        notifySuccess("Professor cadastrado com sucesso!");
      })
      .catch((error) => {
        console.error(error);
        notifyError("Erro ao cadastrar professor. Verifique os dados.");
      });
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
            Cadastro Docente
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
              onChange={(e) => setSenha(e.target.value)}
            />

            <Form.Input
              fluid
              label="Confirmar Senha"
              type="password"
              placeholder="Repita a senha"
              value={confirmarSenha}
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
                onChange={(e, { value }) => setDisciplinas(value)}
                noResultsMessage="Nenhuma disciplina encontrada."
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
};

export default CadastroProfessor;
