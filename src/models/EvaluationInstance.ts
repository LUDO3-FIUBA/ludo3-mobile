import Semester from "./Semester";

// TODO: Esto esta inventado, syncear segun backend
export default class EvaluationInstance {
    readonly id: number;
    readonly type_name: string; // Trabajo Practico | Final | Parcial
    readonly date: Date;
    readonly semester: Semester;

    constructor(
        id: number,
        type_name: string,
        date: Date,
        semester: Semester
    ) {
        this.id = id;
        this.type_name = type_name
        this.date = date
        this.semester = semester
    }
}
