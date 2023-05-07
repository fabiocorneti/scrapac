import { AxiosError } from 'axios';

export function formatAxiosError(error: AxiosError): string {
  let message = `${error.message}`;
  if (error.response) {
    message += ` . Response: ${JSON.stringify(error.response.data)}.`;
  }
  return message;
}
