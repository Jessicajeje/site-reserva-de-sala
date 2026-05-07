import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useLocation } from "react-router-dom";
import { notifyError, notifySuccess } from "../../views/util/Util";
import { Table, Grid, Button, Segment, Form, Header, Icon, Select } from 'semantic-ui-react';

const hoje = new Date();
const diaDaSemanaAtual = hoje.getDay();
const diferenca = hoje.getDate() - diaDaSemanaAtual + (diaDaSemanaAtual === 0 ? -6 : 1);
const segundaFeira = new Date(new Date().setDate(diferenca));

const diasDaSemana = Array.from({ length: 6 }).map((_, i) => {
  const data = new Date(segundaFeira);
  data.setDate(segundaFeira.getDate() + i);
  return data;
});

const formatarDia = (data) => {
  const nome = data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  const dataMes = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return { 
    nome: nome.charAt(0).toUpperCase() + nome.slice(1), 
    data: dataMes 
  };
};

const horariosTurno = {
  Manhã: ['07:15', '08:00', '08:45', '09:45', '10:30', '11:15', '12:00', '12:45'],
  Tarde: ['13:45', '14:30', '15:15', '16:00', '16:45', '17:30'],
  Noite: ['18:30', '19:15', '20:00', '20:45', '21:30', '22:15']
};

export default function Reposicao() {
  const { state } = useLocation();
  const [preview, setPreview] = useState({ dia: null, hora: null });
  const [idReposicao, setIdReposicao] = useState(null);
  const [turnoAtivo, setTurnoAtivo] = useState('Manhã');
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [turma, setTurma] = useState('');

  useEffect(() => {
    if (state != null && state.id != null) {
      axios.get("http://localhost:8080/api/reposicao/" + state.id)
        .then((response) => {
          setIdReposicao(response.data.id);
          setDataSelecionada(response.data.dataSelecionada || '');
          setHoraInicio(response.data.horaInicio || '');
          setHoraFim(response.data.horaFim || '');
          setTurma(response.data.turma || '');
        })
        .catch(() => notifyError("Erro ao carregar dados."));
    }
  }, [state]);

  const selecionarHorario = (dia, hora) => {
    const offset = dia.getTimezoneOffset();
    const dataLocal = new Date(dia.getTime() - (offset * 60 * 1000));
    const dataFormatada = dataLocal.toISOString().split('T')[0];
    
    setDataSelecionada(dataFormatada);
    setPreview({ dia: dia.toString(), hora: hora });
    setHoraInicio(hora);

    const [h, m] = hora.split(':').map(Number);
    const dFim = new Date();
    dFim.setHours(h, m + 45);
    setHoraFim(dFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  };

  const salvarAgendamento = () => {
    const reposicaoRequest = { dataSelecionada, horaInicio, horaFim, turma };
    const request = idReposicao 
      ? axios.put(`http://localhost:8080/api/reposicao/${idReposicao}`, reposicaoRequest)
      : axios.post("http://localhost:8080/api/reposicao", reposicaoRequest);

    request
      .then(() => {
        notifySuccess("Operação realizada com sucesso.");
        setTimeout(() => window.location.reload(), 1000);
      })
      .catch((error) => {
        notifyError(error.response?.data?.message || "Erro na operação.");
      });
  };

  return (
    <div style={{ padding: '2% 5%' }}>
      <Header as="h2" dividing>
        <Icon name="calendar alternate outline" />
        <Header.Content>Reposição de Aulas</Header.Content>
      </Header>

      <Grid stackable columns={2}>
        <Grid.Column width={11}>
          <div style={{ marginBottom: '1.5em', display: 'flex', justifyContent: 'space-between' }}>
             <Select compact options={[{ key: 1, text: 'Semana Atual', value: 1 }]} defaultValue={1} />
             <Button.Group>
                {Object.keys(horariosTurno).map((turno) => (
                  <Button 
                    key={turno}
                    active={turnoAtivo === turno}
                    color={turnoAtivo === turno ? 'green' : null}
                    onClick={() => setTurnoAtivo(turno)}
                  >
                    {turno}
                  </Button>
                ))}
             </Button.Group>
          </div>

          <Table celled definition textAlign="center" color="green">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell />
                {diasDaSemana.map((dia) => {
                  const info = formatarDia(dia);
                  return (
                    <Table.HeaderCell key={dia.toString()}>
                      {info.nome} <br /> {info.data}
                    </Table.HeaderCell>
                  );
                })}
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {horariosTurno[turnoAtivo].map((hora) => (
                <Table.Row key={hora}>
                  <Table.Cell collapsing><b>{hora}</b></Table.Cell>
                  {diasDaSemana.map((dia) => (
                    <Table.Cell 
                      key={dia.toString()} 
                      selectable 
                      onClick={() => selecionarHorario(dia, hora)}
                      style={{ cursor: 'pointer', height: '60px', position: 'relative' }}
                    >
                      {preview.dia === dia.toString() && preview.hora === hora && (
                        <div style={{
                          backgroundColor: '#e2efda',
                          border: '1px solid #84ba55',
                          borderRadius: '8px',
                          position: 'absolute',
                          top: '2px', left: '2px', right: '2px', bottom: '2px',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px'
                        }}>
                          <b>Bruno</b>
                          <Icon name="user circle" />
                          <span>{horaInicio}</span>
                        </div>
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Grid.Column>

        <Grid.Column width={5}>
          <Segment raised>
            <Header as="h3" textAlign="center">Agendar Reposição</Header>
            <Form>
              <Form.Input label="Dia:" type="date" value={dataSelecionada} onChange={(e) => setDataSelecionada(e.target.value)} />
              <Form.Group widths="equal">
                <Form.Input label="Início" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
                <Form.Input label="Fim" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} />
              </Form.Group>
              <Form.Select 
                label="Turma" 
                placeholder="Selecione" 
                value={turma}
                options={[
                    { key: 't1', text: 'ADS - 3º A', value: 'ads3a' },
                    { key: 't2', text: 'Engenharia - 1º B', value: 'eng1b' }
                ]}
                onChange={(e, { value }) => setTurma(value)}
              />
              <Button fluid size="large" color="green" onClick={salvarAgendamento}>
                {idReposicao ? "Salvar Alteração" : "Confirmar Reposição"}
              </Button>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    </div>
  );
}
