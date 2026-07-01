import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Form, Icon, Divider} from "semantic-ui-react";
import {Link} from "react-router-dom";
import { notifyError, notifySuccess, notifyWarn } from "../../views/util/Util";
import { getErrorMessage } from "../util/getErrorMessage";


export default function CadastroDisciplina() {
  const { state } = useLocation();

  const navigate = useNavigate();

  const [idDisciplina, setIdDisciplina] = useState();
  const [nome, setNome] = useState("");
  const [opcoesCurso, setOpcoesCurso] = useState([]);
  const [idCurso, setIdCurso] = useState(null);
  const [periodoOfertado, setPeriodoOfertado] = useState();
  const [chTotal, setChTotal] = useState();

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

    if (state?.id) {
      axios.get("http://localhost:8080/api/disciplina/" + state.id)
        .then((res) => {
          setIdDisciplina(res.data.id);
          setChTotal(res.data.chTotal);
          setPeriodoOfertado(res.data.periodoOfertado);
          setNome(res.data.nome);
          setIdCurso(res.data.idCurso);
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

    if (!nome || !chTotal || !idCurso) {
      notifyWarn("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const disciplinaRequest = {
      nome: nome,
      chTotal: chTotal,
      periodoOfertado: periodoOfertado,
      idCurso: idCurso
    };

    const request = idDisciplina
      ? axios.put(`http://localhost:8080/api/disciplina/${idDisciplina}`, disciplinaRequest)
      : axios.post("http://localhost:8080/api/disciplina", disciplinaRequest);

    request
      .then(() => {
        notifySuccess(idDisciplina ? "Alterada com sucesso!" : "Cadastrada com sucesso!");
        setTimeout(() => navigate("/disciplinas"), 1000); // Redireciona após salvar
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
return (
  <div className="container-cadastro">
    <div className="card-formulario">
      
      {/* CABEÇALHO DO FORMULÁRIO COM LÓGICA DE CONDICIONAL */}
      <h2 className="titulo-form">
        <span style={{ color: "darkgray" }}>
          {idDisciplina === undefined ? "Cadastro" : "Alteração"} &nbsp;
          <Icon name="angle double right" size="small" />
        </span>
        Disciplina
      </h2>

      <Divider />

      {/* CAMPOS DO FORMULÁRIO INTEGRADOS AO CSS PADRÃO */}
      <Form className="formulario-padrao" size="large" style={{ textAlign: "left" }}>
        
        <Form.Input
          fluid
          required
          label="Nome da disciplina:"
          placeholder="Ex: Algoritmos II"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{ marginBottom: "1.5em" }}
        />

        <Form.Group widths="equal">
          <Form.Input
            fluid
            label="Período ofertado:"
            required
            type="number"
            placeholder="Ex: 1"
            value={periodoOfertado}
            onChange={(e) => setPeriodoOfertado(e.target.value)}
          />

          <Form.Input
            fluid
            label="Carga horária (horas):"
            required
            type="number"
            placeholder="Ex: 60"
            value={chTotal}
            onChange={(e, { value }) => setChTotal(value)}
          />
        </Form.Group>

        <Form.Field style={{ marginTop: "1.5em", marginBottom: "2em" }}>
          <Form.Select
            fluid
            required
            label="Curso:"
            placeholder="Selecione o curso"
            options={opcoesCurso}
            value={idCurso}
            onChange={(e, { value }) => setIdCurso(value)}
            noResultsMessage="Nenhum curso encontrado."
          />
        </Form.Field>

        {/* ÁREA DE BOTÕES PADRONIZADA NA BASE DO CARD */}
        <div className="grupo-botoes-form">
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
            to="/consultar-disciplinas" /* Ajuste para a sua rota real da listagem de disciplinas */
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
