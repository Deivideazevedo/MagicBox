/**
 * Erro HTTP base com status code
 * 
 * @param statusCode - Código HTTP de status
 * @param message - Mensagem amigável para o usuário (em português)
 * @param details - Detalhes técnicos do erro para debug
 */
export class HttpError extends Error {
  statusCode: number;
  details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
  }
}

// Erros comuns com mensagens amigáveis em português
export class UnauthorizedError extends HttpError {
  constructor(message = "Autenticação necessária para acessar este recurso", details?: any) {
    super(401, message, details);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Você não tem permissão para acessar este recurso", details?: any) {
    super(403, message, details);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Recurso não encontrado", details?: any) {
    super(404, message, details);
  }
}

export class ValidationError extends HttpError {
  constructor(message = "Dados inválidos", details?: any) {
    super(400, message, details);
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Conflito: recurso já existe", details?: any) {
    super(409, message, details);
  }
}

export class InternalServerError extends HttpError {
  constructor(message = "Erro interno do servidor", details?: any) {
    super(500, message, details);
  }
}
