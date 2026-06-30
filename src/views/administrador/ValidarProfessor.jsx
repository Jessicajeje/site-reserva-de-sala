import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Header, Icon, Table } from "semantic-ui-react";
import { notifyError, notifySuccess } from "../util/Util";
import { getErrorMessage } from "../util/getErrorMessage";

export default function ValidarProfessor() {
  const [professores, setProfessores] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    carregarPendentes();
  }, []);

  function carregarPendentes() {
    axios
      .get("http://localhost:8080/api/professor")
      .then((response) => {
        
        const pendentes = response.data.filter(
          (professor) => professor.ativo === false
        );
        setProfessores(pendentes);
      })
      .catch((error) => {
        const erros = error.response?.data?.errors;
        if (erros?.length > 0) {
          erros.forEach((e) => notifyError(e.defaultMessage));
        } else {
          notifyError(getErrorMessage(error));
        }
      });
  }

  async function validar(id) {
    setLoadingId(id);
    try {
      const professorAtual = professores.find((p) => p.id === id);

      if (!professorAtual) {
        notifyError("Professor não encontrado localmente.");
        return;
      }

      await axios.put(`http://localhost:8080/api/professor/${id}`, {
        ...professorAtual,
        ativo: true,
      });

      notifySuccess("Professor aprovado com sucesso!");
      carregarPendentes();
    } catch (error) {
      console.error(error);
      notifyError("Erro ao validar professor.");
    } finally {
      setLoadingId(null);
    }
  }

  async function reprovar(id) {
    if (!window.confirm("Tem certeza que deseja reprovar este professor? A conta de usuário correspondente será desativada.")) {
      return;
    }

    setLoadingId(id);
    try {
      
      await axios.delete(`http://localhost:8080/api/professor/${id}`);
      
      notifySuccess("Professor reprovado e usuário desabilitado com sucesso!");
      carregarPendentes();
    } catch (error) {
      console.error(error);
      notifyError("Erro ao reprovar professor.");
    } finally {
      setLoadingId(null);
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
                    disabled={loadingId !== null}
                    loading={loadingId === prof.id}
                    onClick={() => validar(prof.id)}
                  />
                  <Button
                    color="red"
                    icon="remove"
                    content="Reprovar"
                    disabled={loadingId !== null}
                    loading={loadingId === prof.id}
                    onClick={() => reprovar(prof.id)}
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