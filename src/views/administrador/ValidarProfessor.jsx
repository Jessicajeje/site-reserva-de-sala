import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Header, Icon, Table, Divider } from "semantic-ui-react";
import { notifyError, notifySuccess } from "../util/Util";
import { getErrorMessage } from "../util/getErrorMessage";
import "./css/turmas.css";

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
  <div style={{ marginTop: "3%" }}>
    <section className="container-turmas" style={{ padding: "2%" }}>
      
      {/* TOPO DA TABELA PADRONIZADO */}
      <div className="topo-tabela" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1%" }}>
        <div>
          <Header as="h2" className="titulo-pagina" style={{ margin: 0, textAlign: "left" }}>
            <Icon name="user check" style={{ marginRight: "10px", fontSize: "0.9em" }} />
            Professores aguardando validação
          </Header>
        </div>
      </div>

      <Divider />

      {/* VERIFICAÇÃO DE LISTA VAZIA OU EXIBIÇÃO DA TABELA COPIANDO O FLUXO DE TURMAS */}
      {!professores || professores.length === 0 ? (
        <div className="estado-vazio" style={{ textAlign: "center", padding: "5% 0" }}>
          <div className="icone-vazio" style={{ fontSize: "3em", color: "#ccc", marginBottom: "15px" }}>
            <Icon name="users" />
          </div>
          <h3>Nenhum professor pendente</h3>
          <p style={{ color: "#777" }}>
            Todos os cadastros de professores já foram validados.
          </p>
        </div>
      ) : (
        <div className="tabela-wrapper">
          <Table color="green" sortable celled className="tabela-turmas">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Nome</Table.HeaderCell>
                <Table.HeaderCell>E-mail</Table.HeaderCell>
                <Table.HeaderCell>SIAPE</Table.HeaderCell>
                <Table.HeaderCell textAlign="center" width={3}>Ações</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {professores.map((prof) => (
                <Table.Row key={prof.id}>
                  <Table.Cell>
                    <div className="curso-cell" style={{ fontWeight: "bold" }}>
                      {prof.nome}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{prof.email}</Table.Cell>
                  <Table.Cell>
                    <div className="periodo-badge">
                      {prof.siape}
                    </div>
                  </Table.Cell>

                  {/* BOTÃO DE APROVAÇÃO ALINHADO AO PADRÃO */}
                  <Table.Cell textAlign="center">
                    <div className="acoes-tabela" style={{ display: "flex", justifyContent: "center" }}>
                      <Button
                        className="btn-nova-turma"
                        style={{ 
                          background: "#5DA348", 
                          color: "white", 
                          borderRadius: "10px", 
                          padding: "10px 16px",
                          boxShadow: "none"
                        }}
                        icon="check"
                        content="Aprovar"
                        labelPosition="left"
                        onClick={() => validar(prof.id)}
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
    </section>
  </div>
);

}
