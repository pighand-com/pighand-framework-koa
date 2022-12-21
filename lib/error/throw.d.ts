declare const errorMessageType = "errorMessageFormat";
interface errorMessage {
    type: string;
    message: string;
    data: JSON;
}
declare class Throw {
    throw(message: string): void;
    throw(message: string, status: number): void;
    throw(message: string, data: JSON): void;
    throw(message: string, data: JSON, status: number): void;
    errorMessageFormat(message: string, data: JSON): string;
}
export default Throw;
export { errorMessageType, errorMessage, Throw };
