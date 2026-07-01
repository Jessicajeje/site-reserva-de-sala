import { Button, Form, Icon, Divider } from "semantic-ui-react";
import {Link} from "react-router-dom";
import axios from "axios";
import { notifyError, notifySuccess } from "../../views/util/Util";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../util/getErrorMessage";
import "./formulario.css";

export default function CadastroCurso() {
  const { state } = useLocation();

  const [idCurso, setIdCurso] = useState();
  const [opcoesDisciplinas, setOpcoesDisciplinas] = useState([]);
  const [nome, setNome] = useState();
  const [qtdPeriodos, setQtdPeriodos] = useState();
  const [area, setArea] = useState();
  const navigate = useNavigate();

  const opcoesArea = [
    { key: "TI", text: "Tecnologia da Informação", value: "ti" },
    { key: "ADM", text: "Administração", value: "adm" },
    { key: "LOGS", text: "Logística", value: "logs" },
    { key: "COM", text: "Comércio", value: "com" },
    { key: "QUA", text: "Qualidade", value: "qual" },
  ];

  const opcoesCurso = [
    { key: "IPI", text: "Informática para Internet", value: "ipi" },
    { key: "QUAL", text: "Qualidade", value: "qual" },
    { key: "ADM", text: "Administração", value: "adm" },
    {
      key: "ADS",
      text: "Análise e desenvolvimento de sistemas",
      value: "ads",
    },
  ];

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
  }, []);

  useEffect(() => {
    if (state != null && state.id != null) {
      axios
        .get("http://localhost:8080/api/curso/" + state.id)
        .then((response) => {
          setIdCurso(response.data.id);
          setNome(response.data.nome);
          setArea(response.data.area);
          setQtdPeriodos(response.data.qtdPeriodos);

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
  }, [state]);

  function salvar() {
    let cursoRequest = {
      nome: nome,
      area: area,
      qtdPeriodos: qtdPeriodos
    };

    if (idCurso != null) {
      axios
        .put("http://localhost:8080/api/curso/" + idCurso, cursoRequest)
        .then(() => {
          notifySuccess("Curso alterado com sucesso.");
          navigate("/cursos");
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
        .post("http://localhost:8080/api/curso", cursoRequest)
        .then(() => {
          notifySuccess("Curso cadastrado com sucesso.");
          navigate("/cursos");
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
          {idCurso === undefined ? "Cadastro" : "Alteração"} &nbsp;
          <Icon name="angle double right" size="small" />
        </span>
        Curso
      </h2>

      <Divider />

      {/* CAMPOS DO FORMULÁRIO INTEGRADOS AO CSS PADRÃO */}
      <Form className="formulario-padrao" size="large">
        
        <Form.Field style={{ marginBottom: "2em", textAlign: "left" }}>
          <Form.Select
            fluid
            label="Nome do curso:"
            placeholder="Selecione o curso"
            options={opcoesCurso}
            required
            value={nome}
            onChange={(e, { value }) => setNome(value)}
          />
        </Form.Field>

        <Form.Field style={{ marginBottom: "2em", textAlign: "left" }}>
          <Form.Select
            fluid
            label="Área:"
            placeholder="Selecione a área"
            options={opcoesArea}
            required
            value={area}
            onChange={(e, { value }) => setArea(value)}
          />
        </Form.Field>

        <Form.Field style={{ marginBottom: "2em", textAlign: "left" }}>
          <Form.Input
            fluid
            label="Quantidade de períodos:"
            type="number"
            placeholder="Ex: 6"
            required
            value={qtdPeriodos}
            onChange={(e, { value }) => setQtdPeriodos(value)}
          />
        </Form.Field>

        {/* ÁREA DE BOTÕES PADRONIZADA NA BASE DO CARD */}
        <div className="grupo-botoes-form">
          <Button
            fluid
            className="btn-salvar-form"
            onClick={salvar}
          >
            <Icon name="checkmark" />
            Concluir
          </Button>

          <Button
            fluid
            className="btn-voltar-form"
            as={Link}
            to="/consultar-cursos" /* Ajuste para a rota real da sua listagem de cursos */
          >
            <Icon name="reply" />
            Voltar
          </Button>
        </div>

      </Form>
    </div>
  </div>
);

}