import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button, Container, Divider, Form, Icon, Grid } from "semantic-ui-react";
import { notifySuccess, notifyError } from "../util/Util";
import { getErrorMessage } from "../util/getErrorMessage";

export default function CadastroAlocacaoAula() {

    const { state } = useLocation();

    const [idAlocacaoAula, setIdAlocacaoAula] = useState(null);

    const [idTurma, setIdTurma] = useState(null);
    const [listaTurma, setListaTurma] = useState([]);

    const [idDisciplina, setIdDisciplina] = useState(null);
    const [listaDisciplina, setListaDisciplina] = useState([]);

    const [idSala, setIdSala] = useState(null);
    const [listaSala, setListaSala] = useState([]);

    const [idProfessor, setIdProfessor] = useState(null);
    const [listaProfessor, setListaProfessor] = useState([]);

    const [semestreLetivo, setSemestreLetivo] = useState("");

    useEffect(() => {

        if (state?.id) {
            axios.get("http://localhost:8080/api/alocacao-aula/" + state.id)
                .then((response) => {
                    const data = response.data;

                    setIdAlocacaoAula(data.id);
                    setIdTurma(data.turma?.id || null);
                    setIdDisciplina(data.disciplina?.id || null);
                    setIdSala(data.sala?.id || null);
                    setIdProfessor(data.professor?.id || null);
                    setSemestreLetivo(data.semestreLetivo || "");
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

        axios.get("http://localhost:8080/api/turma")
            .then((res) => {
                setListaTurma(
                    res.data.map(t => ({ text: t.nome, value: t.id }))
                );
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

        axios.get("http://localhost:8080/api/disciplina")
            .then((res) => {
                setListaDisciplina(
                    res.data.map(d => ({ text: d.nome, value: d.id }))
                );
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

            });;

        axios.get("http://localhost:8080/api/sala")
            .then((res) => {
                setListaSala(
                    res.data.map(s => ({
                        text: `${s.tipo} ${s.numero}`,
                        value: s.id
                    }))
                );
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

            });;

        axios.get("http://localhost:8080/api/professor")
            .then((res) => {
                setListaProfessor(
                    res.data.map(p => ({ text: p.nome, value: p.id }))
                );
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

            });;

    }, [state]);

    function salvar() {

        const alocacaoAulaRequest = {
            id: idAlocacaoAula,
            idTurma,
            idDisciplina,
            idSala,
            idProfessor,
            semestreLetivo
        };

        if (idAlocacaoAula != null) { //Alteração:
            axios.put("http://localhost:8080/api/alocacao-aula/" + idAlocacaoAula, alocacaoAulaRequest)
                .then((response) => { notifySuccess('Alocacao de aula alterada com sucesso.') })
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
        } else { //Cadastro:
            axios.post("http://localhost:8080/api/alocacao-aula", alocacaoAulaRequest)
                .then((response) => { notifySuccess('Alocacao de aula cadastrada com sucesso.') })
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
        <Grid textAlign="center" style={{ height: "98vh", backgroundColor: "#f4f4f4" }} verticalAlign="middle">
            <Grid.Column style={{ maxWidth: 850 }}>
                <Container textAlign="justified">

                    <h2>
                        <span style={{ color: "darkgray" }}>
                            {idAlocacaoAula ? "Alteração" : "Cadastro"} &nbsp;
                            <Icon name="angle double right" size="small" />
                        </span>
                        Alocação de Aula
                    </h2>

                    <Divider />

                    <Form>

                        <Form.Group>
                            <Form.Select
                                required
                                label="Turma"
                                width={8}
                                options={listaTurma}
                                value={idTurma}
                                onChange={(e, { value }) => setIdTurma(value)}
                            />

                            <Form.Select
                                required
                                label="Disciplina"
                                width={8}
                                options={listaDisciplina}
                                value={idDisciplina}
                                onChange={(e, { value }) => setIdDisciplina(value)}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Select
                                required
                                label="Sala"
                                width={8}
                                options={listaSala}
                                value={idSala}
                                onChange={(e, { value }) => setIdSala(value)}
                            />

                            <Form.Select
                                required
                                label="Professor"
                                width={8}
                                options={listaProfessor}
                                value={idProfessor}
                                onChange={(e, { value }) => setIdProfessor(value)}
                            />
                        </Form.Group>

                        <Form.Input
                            required
                            label="Semestre Letivo"
                            value={semestreLetivo}
                            onChange={(e) => setSemestreLetivo(e.target.value)}
                        />

                    </Form>

                    <Button
                        fluid
                        size="huge"
                        color="green"
                        style={{ marginTop: "20px" }}
                        onClick={salvar}
                    >
                        <Icon name="save" />
                        Salvar
                    </Button>

                </Container>

                <Link to={'/alocacoes-aulas'}>
                    <Button
                        type="button"
                        icon
                        labelPosition='left'
                        color='orange'
                        style={{ marginTop: "20px" }}
                    >
                        <Icon name='reply' />
                        Voltar
                    </Button>
                </Link>

            </Grid.Column>
        </Grid>
    );
}