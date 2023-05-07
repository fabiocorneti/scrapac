import { join } from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import getConfiguration from '../configuration';
import Logger from '../logger';
import ElasticsearchQuery from '../query/elasticsearch';

// TODO: host, cert, auth
export default class WebApp {
  private configuration: Configuration;
  private app;

  constructor() {
    this.configuration = getConfiguration();
  }

  start() {
    this.app = express();
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(express.static(join(__dirname, './web/public')));

    this.app.get('/', (_, res) => {
      res.sendFile(join(__dirname, './web/public/index.html'));
    });

    this.app.post('/ask', async (req, res) => {
      const question = req.body?.question || '';
      if (!question) {
        return res.status(400).send({
          error: 'Please send a question'
        });
      }
      const sanitized = question.replace(/\r\n/g, '');

      let answer;
      try {
        const query = new ElasticsearchQuery();
        answer = await query.query(sanitized);
      } catch (e) {
        return res.status(500).send({
          error: `An error occurred processing your question: ${e.message}`
        });
      }

      return res.json({
        answer
      });
    });

    this.app.listen(this.configuration.web.port, () => {
      Logger.getInstance().debug(
        `Web app listening at ${this.configuration.web.port}.`
      );
    });
  }
}
