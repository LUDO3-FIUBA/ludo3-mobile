import Commission from "./Commission";

export interface SemesterSchedule {
    id: number;
    day_of_week: number;   // 0=Lunes … 5=Sábado
    start_time: string;    // "HH:MM:SS"
    end_time: string;
}

export default interface Semester {
    id: number;
    year_moment: string;
    start_date:  Date;
    commission:  Commission;
    max_absences?: number;
    schedules:   SemesterSchedule[];
}
