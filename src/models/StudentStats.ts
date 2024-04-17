export default interface StudentStats {
    averageOverTime: AverageOverTime;
    averageComparison: AverageComparison;
    topSubjects: TopSubjects;
}

export interface AverageComparison {
    studentAverage: number;
    globalAverage: number;
}

interface AverageOverTime {
    [semesterLabel: string]: number;
}

interface TopSubjects { // TODO: does this format make sense?
    [subjectName: string]: AverageComparison;
}
