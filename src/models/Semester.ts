import Commission from "./Commission";

export default interface Semester {
    id: number;
    year_moment: string;
    start_date:  Date;
    commission:  Commission;
    max_absences?: number;
}
