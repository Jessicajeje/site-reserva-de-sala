import { Button, Form, Grid, Segment, Header, Icon } from "semantic-ui-react";
import axios from "axios";
import { notifyError, notifySuccess } from "../../views/util/Util";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../logins/estilo.css";

export default function CadastroCurso() {
  const { state } = useLocation();
  const [idCurso, setIdCurso] = useState();
  const [nome, setNome] = useState();
  const [area, setArea] = useState();
  const [cargaHoraria, setCargaHoraria] = useState();
    const opcoesArea = [
    { key: "adm", text: "Administração", value: "administracao" },
    { key: "qual", text: "Gestão da Qualidade", value: "gestao_qualidade" },
    { key: "tech", text: "Tecnologia da Informação", value: "tecnologia_informacao" },
    { key: "log", text: "Logística", value: "logistica" },
  ];


  const opcoesCurso = [
    { key: "IPI", text: "Informática para Internet", value: "ipi" },
    { key: "QUAL", text: "Qualidade", value: "qual" },
    { key: "ADM", text: "Administração", value: "adm" },
    { key: "ADS", text: "Análise e desenvolvimento de sistemas", value: "ads" },
  ];

  useEffect(() => {
    if (state != null && state.id != null) {
      axios
        .get("http://localhost:8080/api/turma/" + state.id)
        .then((response) => {
          setIdCurso(response.data.id);
          setNome(response.data.nome);
          setCargaHoraria(response.data.cargaHoraria);
          setArea(response.data.area);
        });
    }
  }, [state]);

  function salvar() {
    let cursoRequest = {
      nome: nome,
      cargaHoraria: cargaHoraria,
      area: area
    };

    if (idCurso != null) {
      axios
        .put("http://localhost:8080/api/curso/" + idCurso, cursoRequest)
        .then(() => {
          notifySuccess("Curso alterado com sucesso.");
        })
        .catch((error) => {
          console.error(error);
          notifyError("Erro ao alterar um curso.");
        });
    } else {
      axios
        .post("http://localhost:8080/api/curso", cursoRequest)
        .then(() => {
          notifySuccess("Curso cadastrado com sucesso.");
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
    <Grid textAlign="center" style={{ height: "100vh", backgroundColor: "#f4f4f4" }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 500 }}>
        <Segment raised style={{ padding: "3em" }}>
          <Header as="h1" textAlign="center" style={{ marginBottom: "1.5em" }}>
            {idCurso === undefined ? (
              <h2>
                <span style={{ color: "darkgray" }}>
                  Cadastro <Icon name="angle double right" size="small" />
                </span> Curso
              </h2>
            ) : (
              <h2>
                <span style={{ color: "darkgray" }}>
                  Alteração <Icon name="angle double right" size="small" />
                </span> Curso
              </h2>
            )}
          </Header>

          <Form size="large">
            <Form.Field style={{ marginBottom: "2em", textAlign: "left" }}>
              <label style={{ fontSize: "16px", marginBottom: "10px" }}>Curso:*</label>
              <Form.Select
                fluid
                placeholder="Selecione o curso"
                options={opcoesCurso}
                required
                value={nome}
                onChange={(e, { value }) => setNome(value)}
              />
            </Form.Field>

            <Form.Field style={{ marginBottom: "2em", textAlign: "left" }}>
              <label style={{ fontSize: "16px", marginBottom: "10px" }}>Área:*</label>
              <Form.Select
                fluid
                placeholder="Selecione a área"
                options={opcoesArea}
                required
                value={area}
                onChange={(e, { value }) => setArea(value)}
              />
            </Form.Field>

            <Form.Field style={{ marginBottom: "2em", textAlign: "left" }}>
              <label style={{ fontSize: "16px", marginBottom: "10px" }}>Carga Horária:*</label>
              <Form.Input
                fluid
                required
                type="number"
                placeholder="Ex: 1"
                value={cargaHoraria}
                onChange={(e, { value }) => setCargaHoraria(value)}
              />
            </Form.Field>

            <Button
              fluid
              size="huge"
              style={{ backgroundColor: "#21ba45", color: "#fff", padding: "15px" }}
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
