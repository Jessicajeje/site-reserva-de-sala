import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Form, Grid, Header, Icon, Segment } from "semantic-ui-react";
import { notifyError, notifySuccess, notifyWarn } from "../../views/util/Util";
import "../logins/estilo.css";

//sistema de horários de 45 em 45 minutos
const gerarOpcoesHorarios = () => {
  const horarios = [];
  let data = new Date();
  data.setHours(7, 0, 0, 0); // Inicia às 07:00
  while (
    data.getHours() < 22 ||
    (data.getHours() === 22 && data.getMinutes() === 0)
  ) {
    const horarioFormatado = data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    horarios.push({
      key: horarioFormatado,
      text: horarioFormatado,
      value: horarioFormatado,
    });

    data.setMinutes(data.getMinutes() + 45); // Pula 45 minutos
  }
  return horarios;
};

const opcoesHorarios = gerarOpcoesHorarios();

export default function CadastroDisciplina() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [idDisciplina, setIdDisciplina] = useState();
  const [nome, setNome] = useState("");
  const [area, setArea] = useState("");
  const [turno, setTurno] = useState();
  const [turma, setTurma] = useState(null);
  const [opcoesTurma, setOpcoesTurma] = useState([]);  
  const [opcoesprofessor, setOpcoesprofessor] = useState([]);  
  const [professor, setProfessor] = useState(null);  
  const [horarios, setHorarios] = useState([{ dia: "", horaInicio: "", horaFim: "" }]);

  const opcoesTurno = [
    { key: "manha", text: "Manhã", value: "manha" },
    { key: "tarde", text: "Tarde", value: "tarde" },
    { key: "noite", text: "Noite", value: "noite" },
  ];

  const opcoesArea = [
    { key: "adm", text: "Administração", value: "administracao" },
    { key: "qual", text: "Gestão da Qualidade", value: "gestao_qualidade" },
    { key: "tech", text: "Tecnologia da Informação", value: "tecnologia_informacao" },
    { key: "proc", text: "Processos Gerenciais", value: "processos_gerenciais" },
    { key: "log", text: "Logística", value: "logistica" },
  ];

  const opcoesDias = [
    { key: "seg", text: "Segunda-feira", value: "SEGUNDA" },
    { key: "ter", text: "Terça-feira", value: "TERCA" },
    { key: "qua", text: "Quarta-feira", value: "QUARTA" },
    { key: "qui", text: "Quinta-feira", value: "QUINTA" },
    { key: "sex", text: "Sexta-feira", value: "SEXTA" },
    { key: "sab", text: "Sábado", value: "SABADO" },
  ];
  useEffect(() => {
    axios.get("http://localhost:8080/api/professor")
      .then((res) => {
        setOpcoesprofessor(res.data.map(p => ({ key: p.id, text: p.nome, value: p.id })));
      });

    axios.get("http://localhost:8080/api/turma")
      .then((res) => {
        setOpcoesTurma(res.data.map(t => ({ 
          key: t.id, 
          text: `${t.curso} - ${t.periodo}º Período`, 
          value: t.id 
        })));
      });

    if (state?.id) {
      axios.get("http://localhost:8080/api/disciplina/" + state.id)
        .then((res) => {
          setIdDisciplina(res.data.id);
          setTurno(res.data.turno);
          setNome(res.data.nome);
          setArea(res.data.area);
          setHorarios(res.data.horarios || []);
          
        
          if (res.data.professor) setProfessor(res.data.professor.id);
          if (res.data.turma) setTurma(res.data.turma.id);
        });
    }
  }, [state]);
//crud horarios
  const adicionarHorario = () => {
    setHorarios([...horarios, { dia: "", horaInicio: "", horaFim: "" }]);
  };

  const removerHorario = (index) => {
    const novosHorarios = horarios.filter((_, i) => i !== index);
    setHorarios(novosHorarios);
  };

  const atualizarHorario = (index, campo, valor) => {
    const novosHorarios = [...horarios];
    novosHorarios[index][campo] = valor;
    setHorarios(novosHorarios);
  };

  function salvar() {
    const algumHorarioIncompleto = horarios.some(h => !h.dia || !h.horaInicio || !h.horaFim);

    if (!nome || !area || !turno || !professor || !turma || algumHorarioIncompleto) {
      notifyWarn("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (horarios.some(h => h.horaInicio >= h.horaFim)) {
      notifyError("Horário de início deve ser anterior ao horário de fim.");
      return;
    }

    const disciplinaRequest = {
      area: area,
      nome: nome,
      turno: turno,
      horarios: horarios,
      idProfessor: professor,
      idTurma: turma,
    };

    const request = idDisciplina 
      ? axios.put(`http://localhost:8080/api/disciplina/${idDisciplina}`, disciplinaRequest)
      : axios.post("http://localhost:8080/api/disciplina", disciplinaRequest);

    request
      .then(() => {
        notifySuccess(idDisciplina ? "Alterada com sucesso!" : "Cadastrada com sucesso!");
        setTimeout(() => navigate("/lista-disciplinas"), 1000); // Redireciona após salvar
      })
      .catch(() => notifyError("Erro ao processar a operação."));
  }

  return (
    <Grid textAlign="center" style={{ height: "100vh", backgroundColor: "#f4f4f4" }} verticalAlign="middle">
      <Grid.Column style={{ maxWidth: 550 }}>
        <Segment raised style={{ padding: "3em" }}>
          <Header as="h1" textAlign="center" style={{ marginBottom: "1.5em" }}>
            {idDisciplina === undefined ? (
              <h2><span style={{ color: "darkgray" }}>Cadastro <Icon name="angle double right" size="small" /></span> Disciplina</h2>
            ) : (
              <h2><span style={{ color: "darkgray" }}>Alteração <Icon name="angle double right" size="small" /></span> Disciplina</h2>
            )}
          </Header>

          <Form size="large" style={{ textAlign: "left" }}>
            <Form.Field>
              <label>Área da disciplina:*</label>
              <Form.Select
                fluid
                placeholder="Selecione a área"
                options={opcoesArea}
                value={area}
                onChange={(e, { value }) => setArea(value)}
              />
            </Form.Field>

            <Form.Input
              fluid
              label="Nome da disciplina:*"
              placeholder="Ex: Algoritmos II"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <Form.Field>
              <label>Turno:*</label>
              <Form.Select
                fluid
                placeholder="Selecione o turno"
                options={opcoesTurno}
                value={turno}
                onChange={(e, { value }) => setTurno(value)}
              />
            </Form.Field>
            
                        <Form.Field>
              <label>Professor:*</label>
              <Form.Select
                fluid
                placeholder="Selecione o professor"
                options={opcoesprofessor}
                value={professor}
                onChange={(e, { value }) => setProfessor(value)}
                noResultsMessage="Nenhum professor encontrado."
              />
            </Form.Field>
                        <Form.Field>
              <label>Turma:*</label>
              <Form.Select
                fluid
                placeholder="Selecione a turma"
                options={opcoesTurma}
                value={turma}
                onChange={(e, { value }) => setTurma(value)}
                noResultsMessage="Nenhuma turma encontrada."
              />
            </Form.Field>

            <Header as="h4">Horários da Disciplina</Header>
            {horarios.map((bloco, index) => (
              <Segment key={index} secondary>
                <Form.Field>
                  <label>Dia da Semana:*</label>
                  <Form.Select
                    fluid
                    placeholder="Selecione o dia"
                    options={opcoesDias}
                    value={bloco.dia}
                    onChange={(e, { value }) => atualizarHorario(index, "dia", value)}
                  />
                </Form.Field>
                <Form.Group widths="equal">
                  <Form.Select
                    fluid
                    label="Início"
                    options={opcoesHorarios}
                    value={bloco.horaInicio}
                    onChange={(e, { value }) => atualizarHorario(index, "horaInicio", value)}
                  />
                  <Form.Select
                    fluid
                    label="Fim"
                    options={opcoesHorarios}
                    value={bloco.horaFim}
                    onChange={(e, { value }) => atualizarHorario(index, "horaFim", value)}
                  />
                </Form.Group>
                {horarios.length > 1 && (
                  <Button type="button" color="red" size="mini" onClick={() => removerHorario(index)}>
                    Remover Bloco
                  </Button>
                )}
              </Segment>
            ))}

            <Button type="button" icon labelPosition="left" onClick={adicionarHorario} style={{ marginBottom: '1em' }}>
              <Icon name="add" /> Adicionar Horário
            </Button>

            <Button fluid size="huge" style={{ backgroundColor: "#21ba45", color: "#fff" }} onClick={salvar}>
              Concluir
            </Button>
          </Form>
        </Segment>
      </Grid.Column>
    </Grid>
  );
}
