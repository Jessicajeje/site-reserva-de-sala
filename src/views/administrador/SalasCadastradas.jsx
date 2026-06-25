import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Divider,
  Header,
  Icon,
  Modal,
  Card,
  Menu,
  Form,
  Segment,
} from "semantic-ui-react";
import { notifyError, notifySuccess } from "../util/Util";
import { getErrorMessage } from "../util/getErrorMessage";
import "./Interface.css";

export default function SalasCadastradas() {
  const [lista, setLista] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [idRemover, setIdRemover] = useState();

  const [menuFiltro, setMenuFiltro] = useState();
  const [numero, setNumero] = useState('');
  const [bloco, setBloco] = useState('');
  const [tipo, setTipo] = useState('');

  useEffect(() => {
    carregarLista();
  }, []);

  function carregarLista() {
    axios
      .get("http://localhost:8080/api/sala")
      .then((response) => {
        setLista(response.data);
      })
      .catch((error) => {
        const erros = error.response?.data?.errors;

        if (erros?.length > 0) {
          erros.forEach((e) => {
            notifyError(e.defaultMessage);
          });
        } else {
          notifyError(getErrorMessage(error));
        }
      });
  }

  function confirmaRemover(id) {
    setOpenModal(true);
    setIdRemover(id);
  }

  async function remover() {
    await axios
      .delete("http://localhost:8080/api/sala/" + idRemover)
      .then(() => {
        notifySuccess("Sala removida com sucesso.");
        carregarLista();
      })
      .catch((error) => {
        const erros = error.response?.data?.errors;

        if (erros?.length > 0) {
          erros.forEach((e) => {
            notifyError(e.defaultMessage);
          });
        } else {
          notifyError(getErrorMessage(error));
        }
      });
    setOpenModal(false);
  }

  function handleMenuFiltro() {
    if (menuFiltro === true) {
      setMenuFiltro(false);
    } else {
      setMenuFiltro(true);
    }
  }

  function handleChangeNumero(value) {
    setNumero(value);
    filtrarSalas(value, bloco, tipo);
  }

  function handleChangeBloco(value) {
    setBloco(value);
    filtrarSalas(numero, value, tipo);
  }

  function handleChangeTipo(value) {
    setTipo(value);
    filtrarSalas(numero, bloco, value);
  }

  async function filtrarSalas(numeroParam, blocoParam, tipoParam) {
    let formData = new FormData();

    if (numeroParam !== undefined && numeroParam !== null && numeroParam !== '') {
      formData.append("numero", numeroParam);
    }
    
    if (blocoParam && blocoParam.trim() !== '') {
      formData.append("bloco", blocoParam);
    }
    
    if (tipoParam && tipoParam.trim() !== '') {
      formData.append("tipo", tipoParam);
    }

    await axios
      .post("http://localhost:8080/api/sala/filtrar", formData)
      .then((response) => {
        setLista(response.data);
      })
      .catch((error) => {
        console.error("Erro ao filtrar salas:", error);
      });
  }
  return (
    <div>
      <div style={{ marginTop: "3%" }}>
        <section>
          <Header
            as="h2"
            style={{ textAlign: "left", marginLeft: "2%", marginTop: "5%" }}
          >
            Salas cadastradas
          </Header>
          <Divider />
          <Menu compact>
            <Menu.Item
              name="menuFiltro"
              active={menuFiltro === true}
              onClick={() => handleMenuFiltro()}
            >
              <Icon name="filter" />
              Filtrar
            </Menu.Item>
          </Menu>
          {menuFiltro ? (
            <Segment>
              <Form className="form-filtros">
                <Form.Group widths="equal">
                  <Form.Input
                    icon="search"
                    value={numero}
                    onChange={(e) => handleChangeNumero(e.target.value)}
                    label="Número"
                    placeholder="Filtrar por número"
                    labelPosition="left"
                    width={4}
                  />
                  <Form.Input
                    icon="search"
                    value={bloco}
                    onChange={(e) => handleChangeBloco(e.target.value)}
                    label="Bloco"
                    placeholder="Filtrar por bloco"
                    labelPosition="left"
                    width={4}
                  />
                                <Form.Input
                    icon="search"
                    value={tipo}
                    onChange={(e) => handleChangeTipo(e.target.value)}
                    label="Tipo"
                    placeholder="Filtrar por tipo"
                    labelPosition="left"
                    width={4}
                  />
                </Form.Group>
              </Form>
            </Segment>
          ) : (
            ""
          )}

          <div style={{ marginTop: "3%", padding: "2%" }}>
            <Button
              label="Nova sala"
              color="yellow"
              icon="clipboard outline"
              floated="right"
              as={Link}
              to="/cadastro-sala"
            />
            <br />
            <br />
            <br />

            {lista.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "5%" }}>
                <h3 style={{ opacity: 0.5, color: "grey" }}>
                  Nenhuma sala cadastrada ainda.
                </h3>
              </div>
            ) : (
              <Card.Group itemsPerRow={3} stackable style={{ padding: "1%" }}>
                {lista.map((sala) => (
                  <Card key={sala.id} raised color="green">
                    <Card.Content>
                      <Icon
                        name={
                          sala.tipo === "laboratorio" ? "lab" : "university"
                        }
                        size="large"
                        floated="right"
                      />
                      <Card.Header>
                        {sala.tipo === "laboratorio" ? "Laboratório" : "Sala"}{" "}
                        {sala.numero}
                      </Card.Header>
                      <Card.Meta>
                        {sala.bloco
                          ? sala.bloco.replace("_", " ")
                          : "Bloco não informado"}
                      </Card.Meta>
                    </Card.Content>

                    <Card.Content extra>
                      <div className="ui two buttons">
                        <Button
                          basic
                          color="blue"
                          as={Link}
                          to="/cadastro-sala"
                          state={{ id: sala.id }}
                        >
                          <Icon name="edit" /> Editar
                        </Button>
                        <Button
                          basic
                          color="red"
                          onClick={() => confirmaRemover(sala.id)}
                        >
                          <Icon name="trash" /> Remover
                        </Button>
                      </div>
                    </Card.Content>
                  </Card>
                ))}
              </Card.Group>
            )}
          </div>
        </section>
      </div>

      <Modal
        basic
        onClose={() => setOpenModal(false)}
        onOpen={() => setOpenModal(true)}
        open={openModal}
      >
        <Header icon>
          <Icon name="trash" />
          <div style={{ marginTop: "5%" }}>
            Tem certeza que deseja remover esse registro?
          </div>
        </Header>
        <Modal.Actions>
          <Button
            basic
            color="red"
            inverted
            onClick={() => setOpenModal(false)}
          >
            <Icon name="remove" /> Não
          </Button>
          <Button color="green" inverted onClick={() => remover()}>
            <Icon name="checkmark" /> Sim
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
}
