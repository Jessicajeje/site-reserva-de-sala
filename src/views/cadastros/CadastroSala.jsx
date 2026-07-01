import axios from "axios";
import { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import { Button, Form, Icon, Divider } from "semantic-ui-react";
import { notifyError, notifySuccess } from '../../views/util/Util';
import { getErrorMessage } from "../util/getErrorMessage";
import {Link} from "react-router-dom";

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
  <div className="container-cadastro">
    <div className="card-formulario">
      
      {/* CABEÇALHO DO FORMULÁRIO COM LÓGICA DE CONDICIONAL */}
      <h2 className="titulo-form">
        <span style={{ color: "darkgray" }}>
          {idSala === undefined ? "Cadastro" : "Alteração"} &nbsp;
          <Icon name="angle double right" size="small" />
        </span>
        Sala
      </h2>

      <Divider />

      {/* CAMPOS DO FORMULÁRIO INTEGRADOS AO CSS PADRÃO */}
      <Form className="formulario-padrao" size="large" style={{ textAlign: "left" }}>
        
        <Form.Field style={{ marginBottom: "1.5em" }}>
          <Form.Select
            fluid
            required
            label="Bloco:"
            placeholder="Selecione o bloco"
            options={opcoesBloco}
            value={bloco}
            onChange={(e, { value }) => setBloco(value)}
          />
        </Form.Field>

        <Form.Field style={{ marginBottom: "1.5em" }}>
          <Form.Input
            fluid
            required
            label="Número da sala:"
            type="number"
            placeholder="Ex: 101"
            value={numero}
            onChange={(e, { value }) => setNumero(value)}
          />
        </Form.Field>

        {/* SELEÇÃO DE TIPO (SALA / LABORATÓRIO) ESTILIZADA */}
        <Form.Group inline style={{ margin: "2em 0", padding: "10px", background: "#fafafa", borderRadius: "10px" }}>
          <label style={{ fontWeight: "700", color: "#444", marginRight: "20px" }}>Tipo:*</label>
          <Form.Radio 
            label="Sala" 
            value="sala" 
            checked={tipo === "sala"} 
            onChange={atualizaTipo} 
            style={{ marginRight: "15px" }}
          />
          <Form.Radio 
            label="Laboratório" 
            value="laboratorio" 
            checked={tipo === "laboratorio"} 
            onChange={atualizaTipo} 
          />
        </Form.Group>

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
            to="/cadastro-sala" /* Ajuste para a sua rota real da listagem de salas */
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
