import { Button, Form, Divider, Icon } from "semantic-ui-react";
import axios from "axios";
import { notifyError, notifySuccess } from "../../views/util/Util";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getErrorMessage } from "../util/getErrorMessage";
import { Link } from "react-router-dom";


export default function CadastroTurma() {
  const { state } = useLocation();

  const [idCurso, setIdCurso] = useState();
  const [idTurma, setIdTurma] = useState();

  const [nome, setNome] = useState();
  const [semestreEntrada, setSemestreEntrada] = useState();
  const [anoEntrada, setAnoEntrada] = useState();

  const [qtdAlunosMatriculados, setQtdqtdAlunosMatriculados] = useState();
  const [qtdMaximaAlunos, setQtdMaximaAlunos] = useState();

  const [turno, setTurno] = useState();

  const semestres = [
    { key: "1", text: "1", value: "1" },
    { key: "2", text: "2", value: "2" },
  ];

  const turnos = [
    { key: "manha", text: "Manhã", value: "manha" },
    { key: "tarde", text: "Tarde", value: "tarde" },
    { key: "noite", text: "Noite", value: "noite" },
  ];

  const [opcoesCurso, setOpcoesCurso] = useState([]);

  useEffect(() => {

    axios.get("http://localhost:8080/api/curso")
      .then((response) => {

        const cursosFormatados = response.data.map((curso) => ({
          key: curso.id,
          text: curso.nome,
          value: curso.id,
        }));

        setOpcoesCurso(cursosFormatados);
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

    if (state != null && state.id != null) {

      axios
        .get("http://localhost:8080/api/turma/" + state.id)
        .then((response) => {

          setIdTurma(response.data.id);

          setNome(response.data.nome);

          setSemestreEntrada(response.data.semestreEntrada);

          setAnoEntrada(response.data.anoEntrada);

          setQtdqtdAlunosMatriculados(response.data.qtdAlunosMatriculados);

          setQtdMaximaAlunos(response.data.qtdMaximaAlunos);

          setTurno(response.data.turno);

          if (response.data.curso) {
            setIdCurso(response.data.curso.id);
          }
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

        });;
    }

  }, [state]);

  function salvar() {

    let turmaRequest = {
      nome: nome,
      idCurso: idCurso,
      semestreEntrada: semestreEntrada,
      anoEntrada: Number(anoEntrada),
      qtdAlunosMatriculados: Number(qtdAlunosMatriculados),
      qtdMaximaAlunos: Number(qtdMaximaAlunos),
      turno: turno,
    };

    console.log(turmaRequest);

    if (idTurma != null) {

      axios
        .put("http://localhost:8080/api/turma/" + idTurma, turmaRequest)
        .then(() => {

          notifySuccess("Turma alterada com sucesso.");

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
        .post("http://localhost:8080/api/turma", turmaRequest)
        .then(() => {

          notifySuccess("Turma cadastrada com sucesso.");

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
          {idTurma === undefined ? "Cadastro" : "Alteração"} &nbsp;
          <Icon name="angle double right" size="small" />
        </span>
        Turma
      </h2>

      <Divider />

      {/* CAMPOS DO FORMULÁRIO INTEGRADOS AO CSS PADRÃO */}
      <Form className="formulario-padrao" size="large" style={{ textAlign: "left" }}>
        
        <Form.Group widths="equal">
          <Form.Input
            fluid
            label="Nome da turma:"
            placeholder="Ex: ads-2020.2"
            value={nome}
            onChange={(e, { value }) => setNome(value)}
          />

          <Form.Select
            fluid
            label="Curso:"
            placeholder="Selecione o curso"
            options={opcoesCurso}
            required
            value={idCurso}
            onChange={(e, { value }) => setIdCurso(value)}
          />
        </Form.Group>

        <Form.Group widths="equal">
          <Form.Input
            fluid
            label="Ano de Entrada:"
            required
            type="number"
            placeholder="Ex: 2020"
            value={anoEntrada}
            onChange={(e, { value }) => setAnoEntrada(value)}
          />

          <Form.Select
            fluid
            label="Semestre de Entrada:"
            required
            options={semestres}
            value={semestreEntrada}
            onChange={(e, { value }) => setSemestreEntrada(value)}
          />
        </Form.Group>

        <Form.Field style={{ marginBottom: "1.5em" }}>
          <Form.Select
            fluid
            label="Turno:"
            placeholder="Selecione o turno"
            required
            options={turnos}
            value={turno}
            onChange={(e, { value }) => setTurno(value)}
          />
        </Form.Field>

        <Form.Group widths="equal">
          <Form.Input
            fluid
            label="Quantidade Máxima de Alunos:"
            required
            type="number"
            placeholder="Ex: 30"
            value={qtdMaximaAlunos}
            onChange={(e, { value }) => setQtdMaximaAlunos(value)}
          />

          <Form.Input
            label="Alunos Matriculados:"
            fluid
            required
            type="number"
            placeholder="Ex: 25"
            value={qtdAlunosMatriculados}
            onChange={(e, { value }) => setQtdqtdAlunosMatriculados(value)}
          />
        </Form.Group>

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
            to="/consultar-turmas" /* Ajuste para a sua rota real da listagem de turmas */
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