import axios from "axios";
import { useEffect, useState } from "react";
import { Divider, Header, Table } from "semantic-ui-react";
import "./Interface.css";
import FiltroProfessor from "../../Components/filtros/FiltroProfessor";

export default function ProfessoresAtivos() {
  const [lista, setLista] = useState([]);
  const [buscaNome, setBuscaNome] = useState("");

  useEffect(() => {
    carregarLista();
  }, []);

  function carregarLista() {
    axios.get("http://localhost:8080/api/professor").then((response) => {
      setLista(response.data);
    });
  }

  return (
    
      <div style={{ marginTop: "3%" }}>
        <section textAlign="justified">
          <Header
            as="h2"
            style={{ textAlign: "left", marginLeft: "2%", marginTop: "5%" }}
          >
            Professores Ativos
          </Header>
          <Divider />
            <FiltroProfessor
            setBuscaNome={setBuscaNome} />
          <div style={{ marginTop: "3%", padding: "2%" }}>
            {lista.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "5%" }}>
                <h3 style={{ opacity: 0.5, color: "grey" }}>
                  Nenhum professor cadastrado ainda.
                </h3>
              </div>
            ) : (
              <Table color="green" sortable celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Nome</Table.HeaderCell>
                    <Table.HeaderCell>CPF</Table.HeaderCell>
                    <Table.HeaderCell>E-mail</Table.HeaderCell>
                    <Table.HeaderCell>SIAPE</Table.HeaderCell>

                    <Table.HeaderCell textAlign="center">
                      Ações
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {lista

                    .filter((professor) => {
                      return (
                        professor.nome
                          .toLowerCase()
                          .includes(buscaNome.toLowerCase())
                      );
                    })
                    .map((professor) => (
                      <Table.Row key={professor.id}>
                        <Table.Cell>{professor.nome}</Table.Cell>
                        <Table.Cell>{professor.cpf}</Table.Cell>
                        <Table.Cell>{professor.email}</Table.Cell>
                        <Table.Cell>{professor.siape}</Table.Cell>

                      </Table.Row>
                    ))}
                </Table.Body>
              </Table>
            )}
          </div>
        </section>
      </div>
  );
}
