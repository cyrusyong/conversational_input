import React, { useState, useEffect, Fragment } from 'react';
import Markdown from 'react-markdown';
import "./App.css"

const App = () => {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // New state variable

  const fetchUserData = async () => {
    setIsLoading(true); // Set loading state to true before making the request
    try {
      const response = await fetch(`http://127.0.0.1:5000/getai/${username}`);
      const data = await response.text()
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    setIsLoading(false); // Set loading state to false after the request is completed
  };

  const handleInputChange = (event) => {
    setUsername(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchUserData();
  };

  return (
    <Fragment>
      <header>
        <h1>AI Trust Enhancement</h1>
      </header>
      <div className="container">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={handleInputChange}
            placeholder="Enter username"
          />
          <button type="submit">Get User Data</button>
        </form>
        {isLoading && <div>Loading...</div>} {/* Render loading icon if isLoading is true */}
        {userData && (
          <div className="user-data">
            <h2>User Data</h2>
            <Markdown>{userData}</Markdown>
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default App;