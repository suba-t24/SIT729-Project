import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [events, setEvents] = useState([]);

  const fetchData = async () => {
    try {
      const API_HOST = window.location.hostname;
      const incidentRes = await axios.get(`http://${API_HOST}:3001/api/incidents`);
      setIncidents(incidentRes.data);
      
      const eventRes = await axios.get(`http://${API_HOST}:3001/api/events`);
      setEvents(eventRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <h1>SCEMIRP Dashboard</h1>
        <p>Smart City Emergency Monitoring and Incident Response Platform</p>
      </header>
      
      <main className="main-content">
        <section className="incidents-section">
          <h2>Active Incidents</h2>
          {incidents.length === 0 ? (
            <p>No active incidents.</p>
          ) : (
            <div className="incident-grid">
              {incidents.map(incident => (
                <div key={incident._id} className={`incident-card severity-${incident.severity}`}>
                  <h3>{incident.title}</h3>
                  <p><strong>Location:</strong> {incident.location}</p>
                  <p><strong>Status:</strong> {incident.status}</p>
                  <p><strong>Severity:</strong> {incident.severity.toUpperCase()}</p>
                  <p>{incident.description}</p>
                  <small>{new Date(incident.createdAt).toLocaleString()}</small>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="events-section">
          <h2>Recent Sensor Events</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Device ID</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event._id} className={`event-row severity-${event.severity}`}>
                    <td>{new Date(event.timestamp).toLocaleTimeString()}</td>
                    <td>{event.deviceId}</td>
                    <td>{event.type}</td>
                    <td>{event.location}</td>
                    <td>{event.severity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
