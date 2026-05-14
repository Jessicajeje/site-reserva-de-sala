import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Container,
    Divider,
    Grid,
    Icon,
    Table
} from "semantic-ui-react";

export default function ListAlocacaoAula() {

    const navigate = useNavigate();

    const [lista, setLista] = useState([]);

    useEffect(() => {

        carregarLista();

    }, []);

    function carregarLista() {

        axios.get("http://localhost:8080/api/alocacao-aula")
            .then((response) => {

                setLista(response.data);

            })
            .catch((error) => {

                console.log(error);

            });
    }

    function editar(id) {

        navigate("/cadastro-alocacao-aula", {
            state: { id }
        });
    }

    return (

        <Grid
            textAlign="center"
            style={{ minHeight: "100vh", backgroundColor: "#f4f4f4" }}
        >

            <Grid.Column style={{ maxWidth: 1200, marginTop: "3%" }}>

                <Container textAlign="justified">

                    <h2>
                        <span style={{ color: "darkgray" }}>
                            Listagem &nbsp;
                            <Icon name="angle double right" size="small" />
                        </span>

                        Alocação de Aula
                    </h2>

                    <Divider />

                    <Button
                        color="green"
                        onClick={() => navigate("/cadastro-alocacao-aula")}
                    >
                        <Icon name="plus" />
                        Nova Alocação
                    </Button>

                    <Table celled striped>

                        <Table.Header>

                            <Table.Row>

                                <Table.HeaderCell>ID</Table.HeaderCell>
                                <Table.HeaderCell>Turma</Table.HeaderCell>
                                <Table.HeaderCell>Disciplina</Table.HeaderCell>
                                <Table.HeaderCell>Sala</Table.HeaderCell>
                                <Table.HeaderCell>Professor</Table.HeaderCell>
                                <Table.HeaderCell>Semestre</Table.HeaderCell>
                                <Table.HeaderCell textAlign="center">
                                    Ações
                                </Table.HeaderCell>

                            </Table.Row>

                        </Table.Header>

                        <Table.Body>

                            {lista.map((item) => (

                                <Table.Row key={item.id}>

                                    <Table.Cell>
                                        {item.id}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {item.turma?.nome}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {item.disciplina?.nome}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {item.sala?.numero}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {item.professor?.nome}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {item.semestreLetivo}
                                    </Table.Cell>

                                    <Table.Cell textAlign="center">

                                        <Button
                                            icon
                                            color="blue"
                                            onClick={() => editar(item.id)}
                                        >
                                            <Icon name="edit" />
                                        </Button>

                                    </Table.Cell>

                                </Table.Row>

                            ))}

                        </Table.Body>

                    </Table>

                </Container>

            </Grid.Column>

        </Grid>
    );
}