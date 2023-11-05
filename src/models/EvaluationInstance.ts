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

export class ChiefTeacher {
    readonly first_name: string;
    readonly last_name: string;
    readonly dni: string;
    readonly email: string;
    readonly legajo: string;

    constructor(
        first_name: string,
        last_name: string,
        dni: string,
        email: string,
        legajo: string,
    ) {
        this.first_name = first_name
        this.last_name = last_name
        this.dni = dni
        this.email = email
        this.legajo = legajo
    }
}

export class Commission {
    readonly subject_siu_id: number;
    readonly subject_name: string;
    readonly chief_teacher: ChiefTeacher;

    constructor(
        subject_siu_id: number,
        subject_name: string,
        chief_teacher: ChiefTeacher
    ) {
        this.subject_siu_id = subject_siu_id;
        this.subject_name = subject_name;
        this.chief_teacher = chief_teacher;
    }
}

export class Semester {
    readonly year_moment: string;
    readonly start_date: string;
    readonly commission: Commission;

    constructor(
        year_moment: string,
        start_date: string,
        commission: Commission
    ) {
        this.year_moment = year_moment
        this.start_date = start_date
        this.commission = commission
    }
}