import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import ClipLoader from "react-spinners/ClipLoader";
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './App.less';

import Client from './client';

export default function App() {
  const client = new Client();

  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState('');
  const [error, setError] = React.useState('');
  const [processing, setProcessing] = React.useState(false);

  const sendQuestion = async (event) => {
    setProcessing(true);
    setError(undefined);
    setAnswer(undefined);
    event?.preventDefault();
    try {
      const answer = await client.ask(question);
      setAnswer(answer);
    } catch (e) {
      setError(e.message || 'Unspecified error');
    }
    setProcessing(false);
  };

  return (
    <React.StrictMode>
      <div className="question">
        <form onSubmit={sendQuestion}>
          <textarea
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
            }}
          />
          <button>Ask question</button>
        </form>
      </div>
      <div className="loaderWrapper">
        {processing && <ClipLoader color="#40813c" size={300} />}
      </div>
      {answer && (
        <div className="answer">
          <ReactMarkdown
            children={answer}
            components={{
              code({ _, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    {...props}
                    children={String(children).replace(/\n$/, '')}
                    style={darcula}
                    language={match[1]}
                    PreTag="div"
                  />
                ) : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                );
              }
            }}
          />
        </div>
      )}
      {error && <div className="error">{error}</div>}
    </React.StrictMode>
  );
}
