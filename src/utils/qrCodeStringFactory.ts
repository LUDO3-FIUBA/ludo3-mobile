// these types must be synced with LUDO
enum QRCodeType {
    FinalExamUuid = 'FinalExamUuid',
    AttendanceUuid = 'AttendanceUuid',
    EvaluationUuid = 'EvaluationUuid',
}

export function getQrAttendanceStringFromQrId(qrId: string): string {
    return `ludo:${QRCodeType.AttendanceUuid}:${qrId}`
}

export function getQrEvaluationStringFromEvaluationId(evaluationId: number): string {
    return `ludo:${QRCodeType.EvaluationUuid}:${evaluationId}`
}

export function getQrFinalExamStringFromQrId(qrId: string): string {
    return `ludo:${QRCodeType.FinalExamUuid}:${qrId}`
}
