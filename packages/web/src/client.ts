import axios, { AxiosInstance } from 'axios';

export default class Client {
  private axiosClient: AxiosInstance;

  constructor() {
    this.axiosClient = axios.create({
      baseURL: '/',
      timeout: 90000
    });
  }

  async ask(question: string): Promise<string> {
    let response;
    try {
      response = await this.axiosClient.post(`ask`, {
        question
      });
    } catch (e) {
      throw new Error(
        `An error occurred while processing your question: ${
          e.response?.data?.error || e.message
        }`
      );
    }
    return response.data?.answer || "I don't know";
  }
}
