/**
 * Erro esperado da API, com código HTTP e mensagem em português para o cliente.
 */
class ErroHttp extends Error {
  /**
   * @param {number} status - Código HTTP da resposta
   * @param {string} message - Mensagem enviada ao cliente
   */
  constructor(status, message) {
    super(message);
    this.name = 'ErroHttp';
    this.status = status;
  }
}

module.exports = ErroHttp;
