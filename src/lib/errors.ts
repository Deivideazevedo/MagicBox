/**
 * Erro HTTP base com status code
 */
export class HttpError extends Error {
  statusCode: number;
  details?: string;

  constructor(statusCode: number, message: string, details?: string) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
  }
}


// Erros comuns
export class UnauthorizedError extends HttpError {
  constructor(message = "Autenticação necessária", details?: string) {
    super(401, message, details);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Acesso negado", details?: string) {
    super(403, message, details);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Recurso não encontrado", details?: string) {
    super(404, message, details);
  }
}

export class ValidationError extends HttpError {
  constructor(message = "Dados inválidos", details?: string) {
    super(400, message, details);
  }
}
