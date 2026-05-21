import axios from "axios";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Button,
    Container,
    Dropdown,
    Grid,
    Header,
    Loader,
    Modal,
    Segment,
    Table,
    Divider,
    Icon,
    Select,
} from "semantic-ui-react";

import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { notifySuccess, notifyError } from "../util/Util";

const DIAS_SEMANA = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
];

const DIA_SEMANA_ENUM = [
    "SEGUNDA",
    "TERCA",
    "QUARTA",
    "QUINTA",
    "SEXTA",
    "SABADO",
];

function construirIntervalos(horaInicio, minInicio, count) {
    const slots = [];

    let h = horaInicio;
    let m = minInicio;

    for (let i = 0; i < count; i++) {
        const inicio = `${String(h).padStart(2, "0")}:${String(m).padStart(
            2,
            "0"
        )}`;

        m += 45;

        while (m >= 60) {
            m -= 60;
            h += 1;
        }

        const fim = `${String(h).padStart(2, "0")}:${String(m).padStart(
            2,
            "0"
        )}`;

        slots.push({
            inicio,
            fim,
        });
    }

    return slots;
}

const TURNOS = [
    {
        nome: "Manhã",
        slots: construirIntervalos(7, 30, 6),
    },
    {
        nome: "Tarde",
        slots: construirIntervalos(13, 30, 5),
    },
    {
        nome: "Noite",
        slots: construirIntervalos(18, 30, 4),
    },
];

export default function GradeAlocacaoAula() {
    const [agora, setAgora] = useState(new Date());

    const [horarios, setHorarios] = useState([]);
    const [alocacoes, setAlocacoes] = useState([]);

    const [carregando, setCarregando] = useState(false);

    const [openModal, setOpenModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);

    const [slotSelecionado, setSlotSelecionado] = useState(null);

    const [alocacaoEscolhida, setAlocacaoEscolhida] = useState("");

    const [modoEdicao, setModoEdicao] = useState(false);

    const [horarioEditando, setHorarioEditando] = useState(null);
    const [horarioExcluir, setHorarioExcluir] = useState(null);

    const [turnoSelecionado, setTurnoSelecionado] = useState("Manhã");

    const [turmaSelecionada, setTurmaSelecionada] = useState("");
    const [professorSelecionado, setProfessorSelecionado] = useState("");
    const [disciplinaSelecionada, setDisciplinaSelecionada] = useState("");
    const [salaSelecionada, setSalaSelecionada] = useState("");

    useEffect(() => {
        const timer = setInterval(() => {
            setAgora(new Date());
        }, 30000);

        return () => clearInterval(timer);
    }, []);

    const inicioSemana = useMemo(() => {
        return startOfWeek(agora, {
            weekStartsOn: 1,
        });
    }, [agora]);

    const diasDaSemana = useMemo(() => {
        return DIAS_SEMANA.map((_, i) => addDays(inicioSemana, i));
    }, [inicioSemana]);

    function carregar() {
        setCarregando(true);

        Promise.all([
            axios
                .get("http://localhost:8080/api/alocacao-aula")
                .catch(() => ({ data: [] })),
        ])
            .then(([a]) => {
                const alocacoesData = a.data || [];

                setAlocacoes(alocacoesData);

                const horariosExtraidos = [];

                alocacoesData.forEach((alocacao) => {
                    if (alocacao.horarios) {
                        alocacao.horarios.forEach((horario) => {
                            horariosExtraidos.push({
                                ...horario,
                                alocacaoAula: alocacao,
                            });
                        });
                    }
                });

                setHorarios(horariosExtraidos);
            })
            .finally(() => {
                setCarregando(false);
            });
    }

    useEffect(() => {
        carregar();
    }, []);

    function handleSlotClick(diaIdx, inicio, fim) {
        setSlotSelecionado({
            diaIdx,
            inicio,
            fim,
        });

        setAlocacaoEscolhida("");
        setModoEdicao(false);
        setHorarioEditando(null);

        setOpenModal(true);
    }

    function handleEditarHorario(horario) {
        setHorarioEditando(horario);
        setOpenEditModal(true);
    }

    function handleExcluirHorario(horario) {
        setHorarioExcluir(horario);
        setOpenDeleteModal(true);
    }

    function confirmarExcluirHorario() {
        axios
            .delete(
                `http://localhost:8080/api/alocacao-aula/horario/${horarioExcluir.id}`
            )
            .then(() => {
                notifySuccess("Horário removido com sucesso!");

                setOpenDeleteModal(false);

                carregar();
            })
            .catch((error) => {
                notifyError(
                    error.response?.data?.message || "Erro ao excluir"
                );
            });
    }

    function confirmarEditarHorario() {
        const horario = horarioEditando;

        setModoEdicao(true);

        setSlotSelecionado({
            diaIdx: DIA_SEMANA_ENUM.indexOf(horario.diaSemana),
            inicio: horario.horarioInicio.slice(0, 5),
            fim: horario.horarioFim.slice(0, 5),
        });

        setAlocacaoEscolhida(horario.alocacaoAula?.id);

        setOpenEditModal(false);
        setOpenModal(true);
    }

    function salvarAlocacaoNoHorario() {
        if (!slotSelecionado || !alocacaoEscolhida) {
            notifyError("Selecione uma alocação.");
            return;
        }

        const payload = {
            idAlocacaoAula: Number(alocacaoEscolhida),
            horarioInicio: `${slotSelecionado.inicio}:00`,
            horarioFim: `${slotSelecionado.fim}:00`,
            diaSemana: DIA_SEMANA_ENUM[slotSelecionado.diaIdx],
        };

        const request = modoEdicao
            ? axios.put(
                `http://localhost:8080/api/alocacao-aula/horario/${horarioEditando.id}`,
                payload
            )
            : axios.post(
                `http://localhost:8080/api/alocacao-aula/horario/${alocacaoEscolhida}`,
                payload
            );

        request
            .then(() => {
                notifySuccess(
                    modoEdicao
                        ? "Horário atualizado com sucesso!"
                        : "Horário alocado com sucesso!"
                );

                setOpenModal(false);

                setModoEdicao(false);

                setHorarioEditando(null);

                carregar();
            })
            .catch((error) => {
                if (error.response?.data?.errors !== undefined) {
                    for (
                        let i = 0;
                        i < error.response.data.errors.length;
                        i++
                    ) {
                        notifyError(
                            error.response.data.errors[i].defaultMessage
                        );
                    }
                } else {
                    notifyError(error.response?.data?.message);
                }
            });
    }

    function formatAlocacao(a) {
        const sala = a.sala
            ? `${a.sala.tipo} ${a.sala.numero}`
            : "Sem sala";

        return `${a.disciplina?.nome} • ${a.turma?.nome} • ${sala} • ${a.professor?.nome}`;
    }

    const alocacoesOptions = alocacoes.map((a) => ({
        key: a.id,
        value: a.id,
        text: formatAlocacao(a),
    }));

    const turmaOptions = [
        ...new Map(
            alocacoes
                .filter((a) => a.turma)
                .map((a) => [
                    a.turma.id,
                    {
                        key: a.turma.id,
                        value: a.turma.id,
                        text: a.turma.nome,
                    },
                ])
        ).values(),
    ];

    const professorOptions = [
        ...new Map(
            alocacoes
                .filter((a) => a.professor)
                .map((a) => [
                    a.professor.id,
                    {
                        key: a.professor.id,
                        value: a.professor.id,
                        text: a.professor.nome,
                    },
                ])
        ).values(),
    ];

    const disciplinaOptions = [
        ...new Map(
            alocacoes
                .filter((a) => a.disciplina)
                .map((a) => [
                    a.disciplina.id,
                    {
                        key: a.disciplina.id,
                        value: a.disciplina.id,
                        text: a.disciplina.nome,
                    },
                ])
        ).values(),
    ];

    const salaOptions = [
        ...new Map(
            alocacoes
                .filter((a) => a.sala)
                .map((a) => [
                    a.sala.id,
                    {
                        key: a.sala.id,
                        value: a.sala.id,
                        text: `${a.sala.tipo} ${a.sala.numero}`,
                    },
                ])
        ).values(),
    ];

    const turnosFiltrados = TURNOS.filter(
        (t) => t.nome === turnoSelecionado
    );

    const horariosFiltrados = useMemo(() => {
        return horarios.filter((h) => {
            const a = h.alocacaoAula;

            if (
                turmaSelecionada &&
                a?.turma?.id !== turmaSelecionada
            ) {
                return false;
            }

            if (
                professorSelecionado &&
                a?.professor?.id !== professorSelecionado
            ) {
                return false;
            }

            if (
                disciplinaSelecionada &&
                a?.disciplina?.id !== disciplinaSelecionada
            ) {
                return false;
            }

            if (
                salaSelecionada &&
                a?.sala?.id !== salaSelecionada
            ) {
                return false;
            }

            return true;
        });
    }, [
        horarios,
        turmaSelecionada,
        professorSelecionado,
        disciplinaSelecionada,
        salaSelecionada,
    ]);

    const horarioMap = useMemo(() => {
        const map = new Map();

        for (const h of horariosFiltrados) {
            const key = `${h.diaSemana}__${h.horarioInicio?.slice(0, 5)}`;

            map.set(key, h);
        }

        return map;
    }, [horariosFiltrados]);

    return (
        <Container
            fluid
            style={{
                padding: "20px 30px",
            }}
        >
            <Grid centered>
                <Grid.Row>

                    <Header
                        as="h1"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "10px",
                        }}
                    >
                        <Icon name="calendar alternate outline" />
                        Grade de Horários
                    </Header>

                </Grid.Row>
            </Grid>

            <Divider />

            <Segment style={{ padding: "20px", marginBottom: "20px" }}>
                <Grid stackable>
                    <Grid.Row>

                        <Button
                            color="blue"
                            as={Link}
                            to={"/list-alocacao-aula"}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "10px",
                                justifyContent: "center",
                                margin: "0 auto 20px auto"
                            }}
                        >
                            <Icon name="eye" />
                            Listar as Alocações
                        </Button>

                        <Grid.Column width={16}>
                            <div style={{ display: "flex", gap: "16px" }}>

                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: "8px", fontWeight: "bold" }}>Turno</div>
                                    <Select
                                        fluid
                                        selection
                                        options={[
                                            { key: "Manhã", value: "Manhã", text: "Manhã" },
                                            { key: "Tarde", value: "Tarde", text: "Tarde" },
                                            { key: "Noite", value: "Noite", text: "Noite" },
                                        ]}
                                        value={turnoSelecionado}
                                        onChange={(e, data) => setTurnoSelecionado(data.value)}
                                    />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: "8px", fontWeight: "bold" }}>Turma</div>
                                    <Select
                                        fluid clearable search selection
                                        placeholder="Todas"
                                        options={turmaOptions}
                                        value={turmaSelecionada}
                                        onChange={(e, data) => setTurmaSelecionada(data.value)}
                                    />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: "8px", fontWeight: "bold" }}>Sala</div>
                                    <Select
                                        fluid clearable search selection
                                        placeholder="Todas"
                                        options={salaOptions}
                                        value={salaSelecionada}
                                        onChange={(e, data) => setSalaSelecionada(data.value)}
                                    />
                                </div>

                            </div>
                        </Grid.Column>
                    </Grid.Row>

                    <Grid.Row>
                        <Grid.Column>
                            <div style={{ display: "flex", gap: "16px" }}>

                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: "8px", fontWeight: "bold" }}>Disciplina</div>
                                    <Select
                                        fluid clearable search selection
                                        placeholder="Todas"
                                        options={disciplinaOptions}
                                        value={disciplinaSelecionada}
                                        onChange={(e, data) => setDisciplinaSelecionada(data.value)}
                                    />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: "8px", fontWeight: "bold" }}>Professor</div>
                                    <Select
                                        fluid clearable search selection
                                        placeholder="Todos"
                                        options={professorOptions}
                                        value={professorSelecionado}
                                        onChange={(e, data) => setProfessorSelecionado(data.value)}
                                    />
                                </div>

                            </div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>

            <Segment
                style={{
                    overflowX: "auto",
                    padding: "0",
                }}
            >
                <Table
                    celled
                    structured
                    unstackable
                    compact
                    style={{
                        width: "100%",
                        tableLayout: "fixed",
                        margin: 0,
                    }}
                >
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell
                                textAlign="center"
                                style={{
                                    width: "110px",
                                    minWidth: "110px",
                                    padding: "10px",
                                    fontSize: "13px",
                                }}
                            >
                                Horário
                            </Table.HeaderCell>

                            {diasDaSemana.map((d, i) => {
                                const hoje = isSameDay(d, agora);

                                return (
                                    <Table.HeaderCell
                                        key={i}
                                        textAlign="center"
                                        positive={hoje}
                                        style={{
                                            padding: "10px 6px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontWeight: "bold",
                                                fontSize: "13px",
                                            }}
                                        >
                                            {DIAS_SEMANA[i]}
                                        </div>

                                        <div
                                            style={{
                                                fontSize: "11px",
                                                marginTop: "3px",
                                                opacity: 0.8,
                                            }}
                                        >
                                            {format(d, "dd/MM")}
                                        </div>
                                    </Table.HeaderCell>
                                );
                            })}
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {turnosFiltrados.map((turno) => (
                            <Fragment key={turno.nome}>
                                <Table.Row>
                                    <Table.Cell
                                        colSpan={DIAS_SEMANA.length + 1}
                                        style={{
                                            background: "#f3f4f5",
                                            fontWeight: "bold",
                                            padding: "10px 14px",
                                            fontSize: "14px",
                                        }}
                                    >
                                        {turno.nome}
                                    </Table.Cell>
                                </Table.Row>

                                {turno.slots.map((slot) => (
                                    <Table.Row
                                        key={`${turno.nome}-${slot.inicio}`}
                                    >
                                        <Table.Cell
                                            textAlign="center"
                                            verticalAlign="middle"
                                            style={{
                                                padding: "8px",
                                                fontSize: "12px",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {slot.inicio}
                                            <br />
                                            {slot.fim}
                                        </Table.Cell>

                                        {DIAS_SEMANA.map((_, diaIdx) => {
                                            const key = `${DIA_SEMANA_ENUM[diaIdx]}__${slot.inicio}`;

                                            const h = horarioMap.get(key);

                                            if (h) {
                                                const a =
                                                    h.alocacaoAula || {};

                                                const sala = a.sala
                                                    ? `${a.sala.tipo} ${a.sala.numero}`
                                                    : "";

                                                return (
                                                    <Table.Cell
                                                        key={diaIdx}
                                                        style={{
                                                            padding: "6px",
                                                            height: "90px",
                                                            verticalAlign: "top",
                                                        }}
                                                    >
                                                        <Segment
                                                            color="green"
                                                            style={{
                                                                margin: 0,
                                                                minHeight:
                                                                    "80px",
                                                                padding: "8px",
                                                                display: "flex",
                                                                flexDirection:
                                                                    "column",
                                                                justifyContent:
                                                                    "space-between",
                                                                overflowWrap:
                                                                    "break-word",
                                                                wordBreak:
                                                                    "break-word",
                                                            }}
                                                        >
                                                            <div>
                                                                <div
                                                                    style={{
                                                                        fontWeight:
                                                                            "bold",
                                                                        fontSize:
                                                                            "12px",
                                                                        marginBottom:
                                                                            "6px",
                                                                    }}
                                                                >
                                                                    {a
                                                                        .disciplina
                                                                        ?.nome ??
                                                                        "Aula"}
                                                                </div>

                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            "11px",
                                                                        marginBottom:
                                                                            "4px",
                                                                    }}
                                                                >
                                                                    {
                                                                        a
                                                                            .turma
                                                                            ?.nome
                                                                    }
                                                                </div>

                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            "11px",
                                                                        marginBottom:
                                                                            "4px",
                                                                    }}
                                                                >
                                                                    {sala}
                                                                </div>

                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            "11px",
                                                                    }}
                                                                >
                                                                    {
                                                                        a
                                                                            .professor
                                                                            ?.nome
                                                                    }
                                                                </div>
                                                            </div>

                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    gap: "5px",
                                                                    marginTop:
                                                                        "8px",
                                                                    flexWrap:
                                                                        "wrap",
                                                                }}
                                                            >
                                                                <Button
                                                                    size="mini"
                                                                    color="green"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();

                                                                        handleEditarHorario(
                                                                            h
                                                                        );
                                                                    }}
                                                                >
                                                                    Editar
                                                                </Button>

                                                                <Button
                                                                    size="mini"
                                                                    color="red"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();

                                                                        handleExcluirHorario(
                                                                            h
                                                                        );
                                                                    }}
                                                                >
                                                                    Excluir
                                                                </Button>
                                                            </div>
                                                        </Segment>
                                                    </Table.Cell>
                                                );
                                            }

                                            return (
                                                <Table.Cell
                                                    key={diaIdx}
                                                    selectable
                                                    textAlign="center"
                                                    onClick={() =>
                                                        handleSlotClick(
                                                            diaIdx,
                                                            slot.inicio,
                                                            slot.fim
                                                        )
                                                    }
                                                    style={{
                                                        backgroundColor:
                                                            "#edfbed",
                                                        cursor: "pointer",
                                                        height: "90px",
                                                        verticalAlign:
                                                            "middle",
                                                        fontWeight: "bold",
                                                        fontSize: "12px",
                                                        transition: "0.2s",
                                                    }}
                                                >
                                                    + alocar
                                                </Table.Cell>
                                            );
                                        })}
                                    </Table.Row>
                                ))}
                            </Fragment>
                        ))}
                    </Table.Body>
                </Table>
            </Segment>

            {carregando && (
                <Loader
                    active
                    inline="centered"
                    content="Carregando..."
                    style={{
                        marginTop: "20px",
                    }}
                />
            )}

            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                size="small"
            >
                <Modal.Header>
                    {modoEdicao
                        ? "Editar Alocação"
                        : "Alocar Aula"}
                </Modal.Header>

                <Modal.Content>
                    {slotSelecionado && (
                        <p
                            style={{
                                marginBottom: "20px",
                            }}
                        >
                            <strong>
                                {DIAS_SEMANA[slotSelecionado.diaIdx]}
                            </strong>{" "}
                            • {slotSelecionado.inicio} às{" "}
                            {slotSelecionado.fim}
                        </p>
                    )}

                    <Dropdown
                        fluid
                        search
                        selection
                        placeholder="Selecione uma alocação"
                        options={alocacoesOptions}
                        value={alocacaoEscolhida}
                        onChange={(e, data) =>
                            setAlocacaoEscolhida(data.value)
                        }
                    />
                </Modal.Content>

                <Modal.Actions>
                    <Button onClick={() => setOpenModal(false)}>
                        Cancelar
                    </Button>

                    <Button
                        primary
                        onClick={salvarAlocacaoNoHorario}
                    >
                        Salvar
                    </Button>
                </Modal.Actions>
            </Modal>

            <Modal
                size="tiny"
                open={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
                closeOnDimmerClick={false}
                closeOnEscape={false}
            >
                <Modal.Header>
                    Confirmar exclusão
                </Modal.Header>

                <Modal.Content>
                    <p>
                        Tem certeza que deseja remover esta
                        alocação?
                    </p>
                </Modal.Content>

                <Modal.Actions>
                    <Button
                        onClick={() => setOpenDeleteModal(false)}
                    >
                        Cancelar
                    </Button>

                    <Button
                        negative
                        onClick={confirmarExcluirHorario}
                    >
                        Excluir
                    </Button>
                </Modal.Actions>
            </Modal>

            <Modal
                size="tiny"
                open={openEditModal}
                onClose={() => setOpenEditModal(false)}
                closeOnDimmerClick={false}
                closeOnEscape={false}
            >
                <Modal.Header>
                    Confirmar edição
                </Modal.Header>

                <Modal.Content>
                    <p>
                        Tem certeza que deseja editar esta
                        alocação?
                    </p>
                </Modal.Content>

                <Modal.Actions>
                    <Button
                        onClick={() => setOpenEditModal(false)}
                    >
                        Cancelar
                    </Button>

                    <Button
                        positive
                        onClick={confirmarEditarHorario}
                    >
                        Editar
                    </Button>
                </Modal.Actions>
            </Modal>
        </Container>
    );
}