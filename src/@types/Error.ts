export class MissingParameterError extends Error {
    constructor() {
        super('Você precisa informar um parâmetro!');
        Object.setPrototypeOf(this, MissingParameterError.prototype);
    }
}

export class UnsupportedTrackingCodeError extends Error {
    constructor() {
        super('Código de rastreio não suportado!');
        Object.setPrototypeOf(this, UnsupportedTrackingCodeError.prototype);
    }
}

export class InsufficientPermissionError extends Error {
    constructor() {
        super('Você não tem permissão para fazer isso!');
        Object.setPrototypeOf(this, InsufficientPermissionError.prototype);
    }
}