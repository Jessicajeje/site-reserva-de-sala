import axios from "axios";
import { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import { Button, Form, Grid, Header, Icon, Segment } from "semantic-ui-react";
import { notifyError, notifySuccess } from '../../views/util/Util';
import { getErrorMessage } from "../util/getErrorMessage";

export default function CadastroSala({ lista = [] }) { // Definido como function e exportado diretamente
  const { state } = useLocation();
  const [idSala, setIdSala] = useState();
  const [bloco, setBloco] = useState();
  const [numero, setNumero] = useState();
  const [tipo, setTipo] = useState('sala');



  const opcoesBloco = [
    { key: "b", text: "Bloco B", value: "bloco B" },
    { key: "c", text: "Bloco C", value: "bloco C" },
    { key: "d", text: "Bloco D", value: "bloco D" },
    { key: "a", text: "Bloco A", value: "bloco A" }
  ];

  const atualizaTipo = (e, { value }) => setTipo(value);

  useEffect(() => {
    if (state != null && state.id != null) {
      axios
        .get("http://localhost:8080/api/sala/" + state.id)
        .then((response) => {
          setIdSala(response.data.id);
          setBloco(response.data.bloco);
          setNumero(response.data.numero);
          setTipo(response.data.tipo || 'sala');
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

    let salaRequest = {
      numero: numero,
      bloco: bloco,
      tipo: tipo
    };

    if (idSala != null) {
      axios
        .put("http://localhost:8080/api/sala/" + idSala, salaRequest)
        .then((response) => {
          notifySuccess("Sala alterada com sucesso.");
          setTimeout(() => window.location.reload(), 1000);
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
        .post("http://localhost:8080/api/sala", salaRequest)
        .then((response) => {
          notifySuccess("Sala cadastrada com sucesso.");
          setTimeout(() => window.location.reload(), 1000);
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
    <Grid textAlign="center" style={{ minHeight: '100vh', backgroundColor: '#f4f4f4' }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 500 }}>
        <Segment raised style={{ padding: '3em' }}>
          <Header as="h2" textAlign="center" style={{ marginBottom: '1.5em' }}>
            {idSala === undefined ? (
              <>
                <span style={{ color: "darkgray" }}>Cadastro <Icon name="angle double right" size="small" /></span> Sala
              </>
            ) : (
              <>
                <span style={{ color: "darkgray" }}>Alteração <Icon name="angle double right" size="small" /></span> Sala
              </>
            )}
          </Header>

          <Form size="large">
            <Form.Field style={{ marginBottom: "1.5em" }}>
              <Form.Select
                fluid
                label="Bloco:"
                placeholder="Selecione o bloco"
                options={opcoesBloco}
                value={bloco}
                onChange={(e, { value }) => setBloco(value)}
              />
            </Form.Field>

            <Form.Field style={{ marginBottom: '15px' }}>
              <Form.Input
                label="Número da sala:"
                fluid
                type="number"
                value={numero}
                onChange={(e, { value }) => setNumero(value)}
              />
            </Form.Field>

            <Form.Group inline>
              <label>Tipo:</label>
              <Form.Radio label="Sala" value='sala' checked={tipo === 'sala'} onChange={atualizaTipo} />
              <Form.Radio label="Laboratório" value='laboratorio' checked={tipo === 'laboratorio'} onChange={atualizaTipo} />
            </Form.Group>

            <Button
              fluid
              size="huge"
              style={{ backgroundColor: "#21ba45", color: "#fff" }}
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
