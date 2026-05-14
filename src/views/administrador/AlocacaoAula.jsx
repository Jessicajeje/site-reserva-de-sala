import axios from "axios";
import { Fragment, useEffect, useMemo, useState } from "react";
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
} from "semantic-ui-react";

import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { notifySuccess, notifyError } from "../util/Util";

// Dias úteis
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

// Gera slots de 45 min
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

        const fim = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

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

export default function GradeHorarios() {
    const [agora, setAgora] = useState(new Date());

    const [horarios, setHorarios] = useState([]);
    const [alocacoes, setAlocacoes] = useState([]);

    const [carregando, setCarregando] = useState(false);

    const [openModal, setOpenModal] = useState(false);

    const [slotSelecionado, setSlotSelecionado] = useState(null);

    const [alocacaoEscolhida, setAlocacaoEscolhida] = useState("");

    const [modoEdicao, setModoEdicao] = useState(false);

    const [horarioEditando, setHorarioEditando] = useState(null);

    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const [horarioExcluir, setHorarioExcluir] = useState(null);

    const [openEditModal, setOpenEditModal] = useState(false);

    const [turnoSelecionado, setTurnoSelecionado] = useState("Manhã");
    const [semestreSelecionado, setSemestreSelecionado] = useState("");

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
            axios.get(`http://localhost:8080/api/alocacao-aula`).catch(() => ({ data: [] })),
        ])
            .then(([a]) => {

                const alocacoesData = a.data || [];

                setAlocacoes(alocacoesData);

                // extrai todos os horários das alocações
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
        const key = `${DIA_SEMANA_ENUM[diaIdx]}__${inicio}`;

        if (horarioMap.has(key)) {
            return;
        }

        setSlotSelecionado({
            diaIdx,
            inicio,
            fim,
        });

        setAlocacaoEscolhida("");

        setOpenModal(true);

        setModoEdicao(false);

        setHorarioEditando(null);
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

        axios.delete(
            `http://localhost:8080/api/alocacao-aula/horario/${horarioExcluir.id}`
        )
            .then(() => {

                notifySuccess("Horário removido com sucesso!");

                setOpenDeleteModal(false);

                carregar();
            })
            .catch((error) => {

                notifyError(error.response?.data?.message || "Erro ao excluir");

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

                    for (let i = 0; i < error.response.data.errors.length; i++) {

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

    const semestreOptions = [
        ...new Set(
            alocacoes
                .map((a) => a.semestreLetivo)
                .filter(Boolean)
        ),
    ].map((semestre) => ({
        key: semestre,
        value: semestre,
        text: semestre,
    }));

    const turnosFiltrados = TURNOS.filter(
        (t) => t.nome === turnoSelecionado
    );

    const horariosFiltrados = useMemo(() => {

        if (!semestreSelecionado) {
            return horarios;
        }

        return horarios.filter(
            (h) =>
                h.alocacaoAula?.semestreLetivo === semestreSelecionado
        );

    }, [horarios, semestreSelecionado]);

    const horarioMap = useMemo(() => {

        const map = new Map();

        for (const h of horariosFiltrados) {

            const key = `${h.diaSemana}__${h.horarioInicio?.slice(0, 5)}`;

            map.set(key, h);

        }

        return map;

    }, [horariosFiltrados]);

    return (
        <Container fluid style={{ padding: "20px" }}>
            <Grid>
                <Grid.Row columns={2}>
                    <Grid.Column>
                        <Header as="h1">Grade de Horários</Header>

                        <p>
                            Semana de{" "}
                            <strong>
                                {format(inicioSemana, "dd 'de' MMMM", {
                                    locale: ptBR,
                                })}
                            </strong>{" "}
                            até{" "}
                            <strong>
                                {format(addDays(inicioSemana, 5), "dd 'de' MMMM yyyy", {
                                    locale: ptBR,
                                })}
                            </strong>
                        </p>
                    </Grid.Column>

                    <Grid.Column textAlign="right">
                        <Header as="h2">
                            {format(agora, "HH:mm")}
                        </Header>

                        <p>
                            {format(agora, "EEEE, dd/MM/yyyy", {
                                locale: ptBR,
                            })}
                        </p>
                    </Grid.Column>
                </Grid.Row>
            </Grid>

            <Grid style={{ marginBottom: "15px" }}>
                <Grid.Row columns={2}>
                    <Grid.Column>
                        <label>
                            <strong>Filtrar por turno</strong>
                        </label>

                        <Dropdown
                            fluid
                            selection
                            options={[
                                {
                                    key: "Manhã",
                                    value: "Manhã",
                                    text: "Manhã",
                                },
                                {
                                    key: "Tarde",
                                    value: "Tarde",
                                    text: "Tarde",
                                },
                                {
                                    key: "Noite",
                                    value: "Noite",
                                    text: "Noite",
                                },
                            ]}
                            value={turnoSelecionado}
                            onChange={(e, data) =>
                                setTurnoSelecionado(data.value)
                            }
                        />
                    </Grid.Column>

                    <Grid.Column>
                        <label>
                            <strong>Filtrar por semestre letivo</strong>
                        </label>

                        <Dropdown
                            fluid
                            clearable
                            search
                            selection
                            placeholder="Todos os semestres"
                            options={semestreOptions}
                            value={semestreSelecionado}
                            onChange={(e, data) =>
                                setSemestreSelecionado(data.value)
                            }
                        />
                    </Grid.Column>
                </Grid.Row>
            </Grid>

            <Segment
                style={{
                    overflowX: "hidden",
                }}
            >
                <Table
                    celled
                    structured
                    unstackable
                    style={{
                        width: "100%",
                        tableLayout: "fixed",
                    }}
                >
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell
                                style={{
                                    width: "120px",
                                    minWidth: "120px",
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
                                    >
                                        <div>{DIAS_SEMANA[i]}</div>

                                        <div
                                            style={{
                                                fontSize: "12px",
                                                marginTop: "4px",
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
                                        }}
                                    >
                                        {turno.nome}
                                    </Table.Cell>
                                </Table.Row>

                                {turno.slots.map((slot) => (
                                    <Table.Row key={`${turno.nome}-${slot.inicio}`}>
                                        <Table.Cell>
                                            <strong>
                                                {slot.inicio} - {slot.fim}
                                            </strong>
                                        </Table.Cell>

                                        {DIAS_SEMANA.map((_, diaIdx) => {
                                            const key = `${DIA_SEMANA_ENUM[diaIdx]}__${slot.inicio}`;

                                            const h = horarioMap.get(key);

                                            if (h) {
                                                const a = h.alocacaoAula || {};

                                                const sala = a.sala
                                                    ? `${a.sala.tipo} ${a.sala.numero}`
                                                    : "";

                                                return (
                                                    <Table.Cell
                                                        key={diaIdx}
                                                        style={{
                                                            verticalAlign: "top",
                                                            padding: "6px",
                                                            height: "160px",
                                                        }}
                                                    >
                                                        <Segment
                                                            color="blue"
                                                            style={{
                                                                margin: 0,
                                                                padding: "10px",
                                                                minHeight: "140px",
                                                                overflowWrap: "break-word",
                                                                wordBreak: "break-word",
                                                            }}
                                                        >

                                                            <strong style={{ fontSize: "13px" }}>
                                                                {a.disciplina?.nome ?? "Aula"}
                                                            </strong>

                                                            <p
                                                                style={{
                                                                    marginTop: 5,
                                                                    fontSize: "12px",
                                                                }}
                                                            >
                                                                {a.turma?.nome}
                                                            </p>

                                                            <p style={{ fontSize: "12px" }}>
                                                                {sala}
                                                            </p>

                                                            <p style={{ fontSize: "12px" }}>
                                                                {a.professor?.nome}
                                                            </p>

                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    gap: "6px",
                                                                    marginTop: "8px",
                                                                    flexWrap: "wrap",
                                                                }}
                                                            >
                                                                <Button
                                                                    size="tiny"
                                                                    color="yellow"
                                                                    onClick={(e) => {

                                                                        e.stopPropagation();

                                                                        handleEditarHorario(h);

                                                                    }}
                                                                >
                                                                    Editar
                                                                </Button>

                                                                <Button
                                                                    size="tiny"
                                                                    color="red"
                                                                    onClick={(e) => {

                                                                        e.stopPropagation();

                                                                        handleExcluirHorario(h);

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
                                                        cursor: "pointer",
                                                        height: "160px",
                                                        verticalAlign: "middle",
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
                <Loader active inline="centered" content="Carregando..." />
            )}

            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                size="small"
            >
                <Modal.Header>
                    {modoEdicao ? "Editar Alocação" : "Alocar Aula"}
                </Modal.Header>

                <Modal.Content>
                    {slotSelecionado && (
                        <p>
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
                        style={{
                            marginTop: "15px",
                        }}
                    />
                </Modal.Content>

                <Modal.Actions>
                    <Button onClick={() => setOpenModal(false)}>
                        Cancelar
                    </Button>

                    <Button primary onClick={salvarAlocacaoNoHorario}>
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
                        Tem certeza que deseja remover esta alocação?
                    </p>
                </Modal.Content>

                <Modal.Actions>

                    <Button onClick={() => setOpenDeleteModal(false)}>
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
                        Tem certeza que deseja editar esta alocação?
                    </p>
                </Modal.Content>

                <Modal.Actions>

                    <Button onClick={() => setOpenEditModal(false)}>
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