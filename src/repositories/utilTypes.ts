export class NotASubject extends Error {
    constructor() {
        super('No es un código de materia válido.');
        this.name = 'NotAValidSubjectCode';
    }
}
