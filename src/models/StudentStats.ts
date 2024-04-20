export default interface StudentStats {
    average_over_time: AverageOverTime[];
    student_vs_global_average: StudentVsGlobalAverage;
    best_subjects: BestSubject[];
}

export interface BestSubject {
    subject: string;
    grade: number;
    subject_average: number;
}

interface StudentVsGlobalAverage {
    student_average: number;
    global_average: number;
}

interface AverageOverTime {
    date: string;
    average: number;
}

