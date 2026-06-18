export function getErrorMessage(error) {

    const data = error.response?.data;

    if (!data) {
        return "Erro inesperado.";
    }

    // Bean Validation
    if (data.errors?.length > 0) {
        return data.errors
            .map(e => e.defaultMessage)
            .join("\n");
    }

    // Mensagem simples
    if (typeof data === "string") {
        return data;
    }

    // Outros formatos
    if (data.message) {
        return data.message;
    }

    return "Erro inesperado.";
}