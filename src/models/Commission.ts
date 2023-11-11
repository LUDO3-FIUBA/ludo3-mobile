import ChiefTeacher from "./ChiefTeacher";

export default interface Commission {
    id: number;
    subject_siu_id: number;
    subject_name:   string;
    chief_teacher:  ChiefTeacher;
}
