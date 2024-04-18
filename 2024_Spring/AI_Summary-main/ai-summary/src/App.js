import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [tosText, setTOSText] = useState("");
  const [jsonData, setJsonData] = useState([]);
  const [topic, setTopic] = useState("");
  const [clarifyTopic, setClarifyTopic] = useState('');
  const [clarifyTopicQuestion, setClarifyTopicQuestion] = useState('');
  const [gptClarification, setGPTClarification] = useState('');

  const fetchData = async (link) => {
    try {
      const encodedLink = encodeURI(link);
      const response = await fetch('http://127.0.0.1:5000/get/' + encodedLink + "/" + topic);
      const data = await response.json();
      console.log("API Response:", data);
      console.log("Data type:", typeof data);
      console.log("Is array:", Array.isArray(data));
      setJsonData(data);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const fetchClarification = async () => {
    console.log("fetching");
    const subheading = clarifyTopic;
    const url = tosText;
    const question = clarifyTopicQuestion;

    const encodedLink = encodeURI(url);
    console.log(subheading);
    console.log(url);
    console.log(question);
    const response = await fetch('http://127.0.0.1:5000/clarify/' + encodedLink + "/" + subheading + "/" + question);
    const res = await response.text();
    setGPTClarification(res);
  };

  const handleClarifyTopicQuestionChange = (e) => {
    setClarifyTopicQuestion(e.target.value);
  };

  const handleChangeClarifyTopic = (e) => {
    setClarifyTopic(e.target.value);
    console.log(clarifyTopic);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData(tosText);
  };

  const handleClarificationQuestionSubmit = (e) => {
    e.preventDefault();
    console.log("click");
    fetchClarification();
  };

  const handleTOSChange = (e) => {
    setTOSText(e.target.value);
  };

  const handleTopicChange = (e) => {
    setTopic(e.target.value);
    console.log(topic);
  };

  return (
    <div className='container'>
      <form>
        <div className='section'>
          <label htmlFor="tos-link">Put link to terms and conditions here:</label>
          <input id="tos-link" value={tosText} onChange={handleTOSChange} />
        </div>

        <hr />

        <div className='section'>
          <label>Select the topic(s) is most relevant to you.</label>
          <div>
            <label>
              <input type='radio' value="Don't focus on a specific topic, give a general summary." name='relevant-topic' onChange={handleTopicChange} />
              General Summary
            </label>
          </div>
          <div>
            <label>
              <input type='radio' value="Intellectual Property" name='relevant-topic' onChange={handleTopicChange} />
              Intellectual Property
            </label>
          </div>
          <div>
            <label>
              <input type='radio' value="Consumer Protections" name='relevant-topic' onChange={handleTopicChange} />
              Consumer Protections
            </label>
          </div>
          <div>
            <label>
              <input type='radio' value="Age Restrictions" name='relevant-topic' onChange={handleTopicChange} />
              Age Restrictions
            </label>
          </div>
        </div>

        <button onClick={handleSubmit}>Submit</button>
      </form>

      <div className='section'>
        {jsonData.map(item => (
          <div key={item.subheading}>
            <h1>{item.subheading}</h1>
            <p>{item.body}</p>
          </div>
        ))}
      </div>

      <div className='section'>
        <h1>Clarify a section</h1>
        <div>
          <label htmlFor="clarify-topic">Select a section to clarify:</label>
          <select id="clarify-topic" name='clarify-topic' onChange={handleChangeClarifyTopic}>
            {jsonData.map(item => (
              <option key={item.subheading} value={item.subheading}>{item.subheading}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="clarify-question">Ask a clarification question.</label>
          <input id="clarify-question" onChange={handleClarifyTopicQuestionChange} />
        </div>
        <button onClick={handleClarificationQuestionSubmit}>Submit</button>
      </div>

      <div className='gptClarification'>
        {gptClarification}
      </div>
    </div>
  );
};

export default App;