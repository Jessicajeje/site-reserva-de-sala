import React, { useEffect, useState } from "react";
import { Table, Button, Header, Icon } from "semantic-ui-react";
import axios from "axios";

const ValidarProfessor = () => {
  const [professores, setProfessores] = useState([]);

  useEffect(() => {
    carregarPendentes();
  }, []);

  function carregarPendentes() {
    axios.get("http://localhost:8080/api/professor/pendentes")
      .then((response) => setProfessores(response.data))
      .catch(() => console.log("Erro ao carregar professores."));
  }

  async function validar(id, status) {
    await axios.post(`http://localhost:8080/api/professor/validar/${id}`, { status })
      .then(() => {
        carregarPendentes();
      });
  }

  return (
    <div style={{ padding: '2%' }}>
      <Header as='h2'>
        <Icon name='user check'/>
        Professores aguardando validação
      </Header>

      <Table celled color="green" >
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Nome</Table.HeaderCell>
            <Table.HeaderCell>E-mail</Table.HeaderCell>
             <Table.HeaderCell>Siape</Table.HeaderCell>
            <Table.HeaderCell textAlign="center">Ações</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {professores.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan='4' textAlign="center" style={{ opacity: 0.5, color: 'grey' }}>Nenhum professor pendente.</Table.Cell>
            </Table.Row>
          ) : (
            professores.map((prof) => (
              <Table.Row key={prof.id}>
                <Table.Cell>{prof.nome}</Table.Cell>
                <Table.Cell>{prof.email}</Table.Cell>
                <Table.Cell>{prof.siape}</Table.Cell>
                <Table.Cell textAlign="center">
                  <Button color="green" onClick={() => validar(prof.id, 'APROVADO')}>
                    Aprovar
                  </Button>
                  <Button color="red" onClick={() => validar(prof.id, 'RECUSADO')}>
                    Recusar
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
    </div>
  );
};

export default ValidarProfessor;
