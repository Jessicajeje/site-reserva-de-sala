import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Button,
    Container,
    Divider,
    Grid,
    Icon,
    Table,
    Modal,
    Header
} from "semantic-ui-react";
import { notifyError, notifySuccess } from '../../views/util/Util';
import { getErrorMessage } from "../util/getErrorMessage";

export default function ListAlocacaoAula() {

    const [lista, setLista] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [idRemover, setIdRemover] = useState();

    useEffect(() => {
        carregarLista();
    }, []);

    function carregarLista() {
        axios.get("http://localhost:8080/api/alocacao-aula")
            .then((response) => {
                setLista(response.data);
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

    function abrirModal(id) {
        setIdRemover(id);
        setOpenModal(true);
    }

    async function remover() {

        await axios.delete('http://localhost:8080/api/alocacao-aula/' + idRemover)
            .then((response) => {

                notifySuccess('Alocação de aula removida com sucesso.')

                axios.get("http://localhost:8080/api/alocacao-aula")
                    .then((response) => {
                        setLista(response.data)
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
        setOpenModal(false)
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
                        as={Link}
                        to={"/cadastro-alocacao-aula"}
                    >
                        <Icon name="plus" />
                        Nova Alocação
                    </Button>

                    <Button
                        color="blue"
                        as={Link}
                        to={"/grade-alocacao-aula"}
                        style={{ float: 'right' }}
                    >
                        <Icon name="eye" />
                        Ver Grade das Alocações
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

                            {lista.map((alocacao) => (

                                <Table.Row key={alocacao.id}>

                                    <Table.Cell>
                                        {alocacao.id}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {alocacao.turma?.nome}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {alocacao.disciplina?.nome}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {alocacao.sala?.numero}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {alocacao.professor?.nome}
                                    </Table.Cell>

                                    <Table.Cell>
                                        {alocacao.semestreLetivo}
                                    </Table.Cell>

                                    <Table.Cell textAlign="center">

                                        <Button
                                            icon
                                            color="green"
                                        >
                                            <Link to="/cadastro-alocacao-aula" state={{ id: alocacao.id }} style={{ color: 'green' }}> <Icon name='edit' /> </Link>
                                        </Button>

                                        <Button
                                            icon
                                            color="red"
                                            onClick={() => abrirModal(alocacao.id)}
                                        >
                                            <Icon name="trash" />
                                        </Button>

                                    </Table.Cell>

                                </Table.Row>

                            ))}

                        </Table.Body>

                    </Table>

                </Container>

            </Grid.Column>

            <Modal
                basic
                onClose={() => setOpenModal(false)}
                onOpen={() => setOpenModal(true)}
                open={openModal}
            >
                <Header icon>
                    <Icon name='trash' />
                    <div style={{ marginTop: '5%' }}> Tem certeza que deseja remover esse registro? </div>
                </Header>
                <Modal.Actions>
                    <Button basic color='red' inverted onClick={() => setOpenModal(false)}>
                        <Icon name='remove' /> Não
                    </Button>
                    <Button color='green' inverted onClick={() => remover()}>
                        <Icon name='checkmark' /> Sim
                    </Button>
                </Modal.Actions>
            </Modal>

        </Grid>

    );
}