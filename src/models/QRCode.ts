export interface QRCode {
    type: QRCodeType;
    parsedUuid: string;
}

enum QRCodeType {
    FinalExamUuid = 'FinalExamUuid',
    AttendanceUuid = 'AttendanceUuid',
    EvaluationUuid = 'EvaluationUuid',
    StudentIdentityUrl = 'StudentIdentityUrl',
}

class UnsupportedQRSchema extends Error {
    constructor() {
        super('QR no soportado');
        this.name = 'UnsupportedQRSchema';
    }
}

/**
 * Parses raw QR code data into a supported type. Support LUDO1 and LUDO2 formats.
 * 
 * LUDO1 format:
 *  `rawData = '${finalExamUuid}'`
 * 
 * LUDO2 format:
 *  `rawData = 'ludo:${type}:${parsedUuid}'`
 * 
 * Example:
 *  `rawData = 'ludo:EvaluationUuid:d118ff4e-57cc-43d1-8fc0-125188f45dd5'`
 * 
 * @param rawData raw string scanned by the camera
 * @returns parsed QRCode interface. Raises error if format is incorrect.
 */
function parseQrCodeData(rawData: string): QRCode {
    if (rawData.startsWith('http://') || rawData.startsWith('https://')) {
        const frontendMatch = rawData.match(/\/credencial\/(.+)$/);
        if (frontendMatch?.[1]) {
            return { type: QRCodeType.StudentIdentityUrl, parsedUuid: frontendMatch[1] };
        }
        const backendMatch = rawData.match(/\/api\/student_identity\/identity\/(.+?)\/?$/);
        if (backendMatch?.[1]) {
            return { type: QRCodeType.StudentIdentityUrl, parsedUuid: backendMatch[1] };
        }
        throw new UnsupportedQRSchema();
    }

    const values = rawData.split(':')

    if (values.length === 1) {
        // Old schema (LUDO1), assume final exam
        return { type: QRCodeType.FinalExamUuid, parsedUuid: rawData }
    } else if (values.length === 3) {
        // New schema (LUDO2)
        const typeString = values[1]
        const parsedUuid = values[2]

        switch (typeString) {
            case QRCodeType.FinalExamUuid:
                return { type: QRCodeType.FinalExamUuid, parsedUuid }
            case QRCodeType.AttendanceUuid:
                return { type: QRCodeType.AttendanceUuid, parsedUuid }
            case QRCodeType.EvaluationUuid:
                return { type: QRCodeType.EvaluationUuid, parsedUuid }
            default:
                console.error(`QR Code not supported. Scanned value was ${rawData}`)
                throw new UnsupportedQRSchema()
        }
    } else {
        console.error(`QR Code not supported. Scanned value was ${rawData}`)
        throw new UnsupportedQRSchema()
    }
}

export const qrCodeUtils = {
  QRCodeType,
  parseQrCodeData,
  UnsupportedQRSchema
};
