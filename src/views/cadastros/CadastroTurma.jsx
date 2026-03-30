
import { Button, Form, Grid, Segment, Header } from "semantic-ui-react";
import axios from "axios";
import { notifyError, notifySuccess } from '../../views/util/Util';
import {useState} from 'react';

const CadastroTurma = () => {
        const opcoesCurso = [
    { key: "IPI", text: "Informática para Internet", value: "ipi" },
    { key: "QUAL", text: "Qualidade", value: "qual" },
    { key: "ADM", text: "Administração", value: "adm" },
    { key: "ADS", text: "Análise e desenvolvimento de sistemas", value: "ads" }
    
  ];
    const[cursoSelecionado, setCursoSelecionado]= useState();
    const[periodo, setPeriodo]= useState();

        function salvar(){
      let turmaRequest = {
        opcoesCurso: opcoesCurso,
        cursoSelecionado: cursoSelecionado,
       periodo:periodo
      };
       
           axios.post("http://localhost:8080/api/turma", turmaRequest)
            .then((response) => {
              notifySuccess("Turma cadastrada com sucesso!");
            })
            .catch((error) => {
              console.error(error);
              notifyError("Erro ao cadastrar turma. Verifique os dados.");
            });

       
    }

    
  return (
     <Grid textAlign="center" style={{ height: '100vh', backgroundColor: '#f4f4f4' }} verticalAlign="middle">
          <Grid.Column style={{ maxWidth: 500 }}>
    
            <Segment raised style={{ padding: '3em' }}>
              <Header as="h1" textAlign="center" style={{ marginBottom: '1.5em', fontSize: '2em' }}>
                Cadastro de Turma
              </Header>
    
              <Form size="large">
                
                <Form.Field style={{ marginBottom: '15%', textAlign: 'left' }}>
                  <label style={{ fontSize: '16px', marginBottom: '10px', textAlign: 'left' }}>Curso:*</label>
                  <Form.Select
                    fluid
                    options={opcoesCurso}
                    required
                    value={cursoSelecionado}
                    onChange={(e, { value }) => setCursoSelecionado(value)}
                  />
                </Form.Field>
    
                <Form.Field style={{ marginBottom: '15%', textAlign: 'left' }}>
                  <label style={{ fontSize: '16px', marginBottom: '10px', textAlign: 'left' }}>Número da sala:*</label>
                  <Form.Input
                    fluid
                    required
                    type="number"
                    value={periodo}
                    onChange={(e, {value}) => setPeriodo(value)}
                  />
                </Form.Field>

                <Button
                  fluid
                  size="huge"
                  style={{ backgroundColor: "#21ba45", color: "#fff", padding: '15px' }}
                  onClick ={salvar}
                >
                  Concluir
                </Button>
              </Form>
            </Segment>
    
          </Grid.Column>
        </Grid>
  )
}

export default CadastroTurma