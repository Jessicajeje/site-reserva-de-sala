import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Header, Icon, Table } from "semantic-ui-react";
import { notifyError, notifySuccess } from "../util/Util";

export default function ValidarProfessor() {
  const [professores, setProfessores] = useState([]);

  useEffect(() => {
    carregarPendentes();
  }, []);

  function carregarPendentes() {
    axios
      .get("http://localhost:8080/api/professor")
      .then((response) => {
        const pendentes = response.data.filter(
          (professor) => professor.ativo === false,
        );
        setProfessores(pendentes);
      })
      .catch(() => {
        console.log("Erro ao carregar professores.");
      });
  }

 async function validar(id) {
  try {
    //Busca os dados atuais do professor diretamente da lista do estado
    const professorAtual = professores.find(p => p.id === id);
    
    if (!professorAtual) {
      notifyError("Professor não encontrado localmente.");
      return;
    }

    //Envia o objeto completo esperado pelo ProfessorRequest do backend
    await axios.put(`http://localhost:8080/api/professor/${id}`, {
      ...professorAtual,
      ativo: true        
    });

    notifySuccess("Professor aprovado com sucesso!");
    carregarPendentes();
  } catch (error) {
    console.error(error);
    notifyError("Erro ao validar professor.");
  }
  }

  return (
    <div style={{ padding: "2%" }}>
      <Header as="h2">
        <Icon name="user check" />
        <Header.Content>Professores aguardando validação</Header.Content>
      </Header>

      <Table celled color="green">
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
              <Table.Cell
                colSpan="4"
                textAlign="center"
                style={{ opacity: 0.5, color: "grey" }}
              >
                Nenhum professor pendente.
              </Table.Cell>
            </Table.Row>
          ) : (
            professores.map((prof) => (
              <Table.Row key={prof.id}>
                <Table.Cell>{prof.nome}</Table.Cell>
                <Table.Cell>{prof.email}</Table.Cell>
                <Table.Cell>{prof.siape}</Table.Cell>
                <Table.Cell textAlign="center">
                  <Button
                    color="green"
                    icon="check"
                    content="Aprovar"
                    onClick={() => validar(prof.id)}//ativo == true
                  />
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>
    </div>
  );
}
