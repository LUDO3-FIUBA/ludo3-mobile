export interface SemesterStats {
    semester_average: SemesterAverage[];
    desertions: Dessertion[];
    attendance_rate?: number;
}

export interface Dessertion {
    date: string;
    students_deserted: number;
}

interface SemesterAverage {
    year: number;
    year_moment: string;
    average: number;
}
