const errorMessageType = 'errorMessageFormat';

interface errorMessage {
    type: string;
    message: string;
    data: JSON;
}

class Throw {
    throw(message: string): void;
    throw(message: string, status: number): void;

    throw(message: string, data: JSON): void;
    throw(message: string, data: JSON, status: number): void;

    throw(message: string, dataOrStatus?: number | JSON, status?: number) {
        const data =
            !dataOrStatus || typeof dataOrStatus === 'number'
                ? null
                : dataOrStatus;
        const realStatus =
            dataOrStatus && typeof dataOrStatus === 'number'
                ? dataOrStatus
                : status || 500;

        const messageFormatString: errorMessage = {
            type: errorMessageType,
            message,
            data,
        };

        const err: { message: string; status?: number } = new Error(
            JSON.stringify(messageFormatString),
        );
        err.status = realStatus;
        throw err;
    }

    errorMessageFormat(message: string, data: JSON) {
        const messageJSON: errorMessage = {
            type: errorMessageType,
            message,
            data,
        };

        return JSON.stringify(messageJSON);
    }
}

export default Throw;
export { errorMessageType, errorMessage, Throw };
