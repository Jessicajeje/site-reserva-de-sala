import axios from "axios";
import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Form, Icon, Divider } from "semantic-ui-react";
import { notifyError, notifySuccess } from "../../views/util/Util";
import { Link } from 'react-router-dom';
import { getErrorMessage } from "../util/getErrorMessage";

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

          const erros = error.response?.data?.errors;

          if (erros?.length > 0) {

            erros.forEach(e => {
              notifyError(e.defaultMessage);
            });

          } else {
            notifyError(getErrorMessage(error));
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

          const erros = error.response?.data?.errors;

          if (erros?.length > 0) {

            erros.forEach(e => {
              notifyError(e.defaultMessage);
            });

          } else {
            notifyError(getErrorMessage(error));
          }

        });
    }
  }

  return (
  <div className="container-cadastro">
    <div className="card-formulario">
      
      {/* CABEÇALHO DO FORMULÁRIO COM LÓGICA DE CONDICIONAL */}
      <h2 className="titulo-form">
        <span style={{ color: "darkgray" }}>
          {idProfessor === undefined ? "Cadastro" : "Alteração"} &nbsp;
          <Icon name="angle double right" size="small" />
        </span>
        Docente
      </h2>

      <Divider />

      {/* CAMPOS DO FORMULÁRIO INTEGRADOS AO CSS PADRÃO */}
      <Form className="formulario-padrao" size="large" style={{ textAlign: "left" }}>
        <Form.Group widths="equal">
          <Form.Input
            fluid
            required
            label="Nome"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <Form.Field required>
            <label>CPF</label>
            <IMaskInput
              mask="000.000.000-00"
              value={cpf}
              onAccept={(value) => setCpf(value)}
              placeholder="000.000.000-00"
              style={{
                padding: "12px 15px",
                border: "1px solid #cccccc",
                borderRadius: "10px",
                width: "100%",
              }}
            />
          </Form.Field>
        </Form.Group>

        <Form.Group widths="equal">
          <Form.Field required>
            <label>SIAPE</label>
            <IMaskInput
              mask="00000000"
              placeholder="Nº SIAPE"
              value={siape}
              onAccept={(value) => setSiape(value)}
              style={{
                padding: "12px 15px",
                border: "1px solid #cccccc",
                borderRadius: "10px",
                width: "100%",
              }}
            />
          </Form.Field>

          <Form.Input
            fluid
            required
            label="E-mail"
            placeholder="Email institucional"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Input
          fluid
          required={!idProfessor}
          label="Senha"
          type="password"
          placeholder="Digite uma senha"
          value={password}
          disabled={!!idProfessor}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: "1.5em" }}
        />

        <Form.Input
          fluid
          required={!idProfessor}
          label="Confirmar Senha"
          type="password"
          placeholder="Repita a senha"
          value={confirmarSenha}
          disabled={!!idProfessor}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          error={
            confirmarSenha !== "" && password !== confirmarSenha
              ? { content: "As senhas não coincidem", pointing: "below" }
              : false
          }
        />

        {/* ÁREA DE BOTÕES PADRONIZADA NA BASE DO CARD */}
        <div className="grupo-botoes-form" style={{ marginTop: "25px" }}>
          <Button
            fluid
            className="btn-salvar-form"
            type="button"
            onClick={salvar}
          >
            <Icon name="checkmark" />
            Concluir
          </Button>

          <Button
            fluid
            className="btn-voltar-form"
            as={Link}
            to="/"
          >
            <Icon name="reply" />
            Voltar para login docente
          </Button>
        </div>

      </Form>
    </div>
  </div>
);

}