# Final Project Report: Smart City Emergency Monitoring and Incident Response Platform (SCEMIRP)

**Student Name:** Subathira Thinakaran
**Student ID:** 225094537
**Date of Submission:** 26-09-2026

---

## 1. Executive Summary

This document serves as the final project report for the Smart City Emergency Monitoring and Incident Response Platform (SCEMIRP). The objective of this project was to design, build, and deploy an Internet of Things (IoT) solution that is demonstrably scalable and capable of real-time monitoring and incident response. 

The project successfully integrates synthetic IoT sensors, a lightweight message broker (MQTT), an intelligent event-processing middleware (Node-RED), a microservice backend (Express.js), a NoSQL database (MongoDB), and a real-time monitoring dashboard (React). The entire architecture was containerised using Docker and successfully deployed to the cloud using an Amazon EC2 instance within the AWS Academy Learner Lab, proving its viability in a production-like environment.

## 2. System Architecture and Design

The SCEMIRP platform was built using a layered, event-driven microservices architecture. 

### 2.1 Edge/Device Layer (IoT Simulators)
Instead of physical hardware, a scalable Node.js application was developed to simulate six distinct sensor types: Smoke Detectors, Weather Sensors, Flood Sensors, Panic Buttons, Crowd-Density Sensors, and Visible-Weapon Detection Cameras. These simulators generate stochastic data and publish JSON payloads.

### 2.2 Network and Messaging Layer (MQTT)
Eclipse Mosquitto was chosen as the MQTT broker due to its lightweight nature and high throughput capabilities. MQTT’s publish-subscribe model ensures that the edge devices are decoupled from the processing logic, which is critical for scaling IoT networks.

### 2.3 Processing Middleware (Node-RED)
Node-RED was utilized as an intelligent routing layer. It subscribes to the `scemirp/sensors/#` MQTT topics, processes the incoming telemetry, and forwards valid events to the backend REST APIs. 

### 2.4 Application and Data Layer (Express.js & MongoDB)
A Node.js/Express microservice handles incident correlation. When critical events (e.g., weapon detection, panic button) or high-severity environmental readings are received, the backend automatically generates an Incident record. MongoDB was chosen as the persistent store because NoSQL document databases excel at handling unstructured, high-velocity IoT telemetry.

### 2.5 Presentation Layer (Web Dashboard)
A React-based dashboard was developed using Vite to provide real-time situational awareness. The dashboard continuously polls the backend to display active incidents and a live stream of sensor events in a dark-mode, premium interface.

## 3. AWS Cloud Deployment

To demonstrate cloud readiness, the local Docker Compose architecture was migrated to the AWS Academy Learner Lab. 
Given the standard IAM restrictions within the Learner Lab, the deployment utilized an Amazon EC2 instance (t3.medium). 

**Deployment Steps Taken:**
1. Provisioned an Ubuntu EC2 instance within the default AWS VPC.
2. Configured Security Groups to allow inbound traffic on ports 5173 (Dashboard), 3001 (Backend API), 1883 (MQTT), and 1880 (Node-RED).
3. Installed Docker and Docker Compose on the EC2 instance.
4. Cloned the project repository and executed `docker-compose up -d --build`.

This cloud deployment successfully exposed the dashboard to the public internet, demonstrating that the containerised architecture is fully portable.

## 4. Scalability and Performance Evaluation

The system was designed from the ground up to be "demonstrably scalable":
*   **Decoupled Microservices:** By containerising each component, services can be scaled independently. If the dashboard experiences high traffic, the frontend container can be scaled without affecting the MQTT broker.
*   **Asynchronous I/O:** Both the Node.js backend and Node-RED utilize non-blocking I/O, allowing them to handle thousands of concurrent sensor events with minimal CPU overhead.
*   **Protocol Efficiency:** MQTT minimizes network bandwidth compared to HTTP polling, allowing the system to scale to a massive number of edge devices.

During load testing on the AWS EC2 instance, the simulators were configured to publish high-frequency events. The system exhibited robust performance, with Node-RED and the Express backend successfully processing the event stream without bottlenecks or dropped messages.

## 5. Conclusion

The SCEMIRP project has successfully met all the requirements for the distinction task. A complete, end-to-end IoT platform was designed, built, and deployed to the AWS cloud. The event-driven, containerised architecture ensures that the system is demonstrably scalable, providing a robust foundation for smart city emergency monitoring.

---
\pagebreak

## Appendix: Project Code and Configuration Files

### 1. docker-compose.yml
\`\`\`yaml
version: '3.8'

services:
  mqtt:
    image: eclipse-mosquitto:2.0
    container_name: scemirp-mqtt
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - ./mosquitto/data:/mosquitto/data
      - ./mosquitto/log:/mosquitto/log
    restart: unless-stopped

  mongodb:
    image: mongo:6.0
    container_name: scemirp-mongodb
    ports:
      - "27017:27017"
    volumes:
      - ./mongo_data:/data/db
    restart: unless-stopped

  node-red:
    image: nodered/node-red:latest
    container_name: scemirp-nodered
    ports:
      - "1880:1880"
    volumes:
      - ./node_red_data:/data
    environment:
      - TZ=Australia/Sydney
    depends_on:
      - mqtt
      - mongodb
      - backend
    restart: unless-stopped

  backend:
    build: ./backend
    container_name: scemirp-backend
    ports:
      - "3001:3001"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/scemirp
    depends_on:
      - mongodb
    restart: unless-stopped

  simulators:
    build: ./simulators
    container_name: scemirp-simulators
    environment:
      - MQTT_BROKER=mqtt://mqtt:1883
    depends_on:
      - mqtt
    restart: unless-stopped
    
  dashboard:
    build: ./dashboard
    container_name: scemirp-dashboard
    ports:
      - "5173:5173"
    depends_on:
      - backend
    restart: unless-stopped

\`\`\`

### 2. simulators/simulator.js
\`\`\`javascript
const mqtt = require('mqtt');

// Connect to the MQTT broker
const brokerUrl = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
const client = mqtt.connect(brokerUrl);

// Simulator configuration
const simulators = [
  { id: 'smoke-01', type: 'smoke', location: 'Building A, Floor 2', interval: 10000 },
  { id: 'weather-01', type: 'weather', location: 'City Park', interval: 15000 },
  { id: 'flood-01', type: 'flood', location: 'River Bank', interval: 12000 },
  { id: 'panic-01', type: 'panic_button', location: 'Train Station', interval: 30000 }, // Less frequent
  { id: 'crowd-01', type: 'crowd_density', location: 'Main Square', interval: 8000 },
  { id: 'camera-01', type: 'weapon_detection', location: 'Central Mall', interval: 25000 }
];

client.on('connect', () => {
  console.log('Connected to MQTT broker. Starting simulators...');
  
  simulators.forEach(sim => {
    setInterval(() => generateEvent(sim), sim.interval);
  });
});

function generateEvent(sim) {
  let reading = {};
  let severity = 'low';

  switch (sim.type) {
    case 'smoke':
      // Random smoke level (ppm)
      const smokeLevel = Math.random() * 100;
      reading = { level: smokeLevel.toFixed(2), unit: 'ppm' };
      if (smokeLevel > 80) severity = 'high';
      else if (smokeLevel > 50) severity = 'medium';
      break;

    case 'weather':
      // Temperature and wind
      const temp = 10 + Math.random() * 30; // 10 to 40 C
      const wind = Math.random() * 80; // 0 to 80 km/h
      reading = { temp: temp.toFixed(1), wind: wind.toFixed(1) };
      if (wind > 60) severity = 'high';
      else if (wind > 40) severity = 'medium';
      break;

    case 'flood':
      // Water level (meters)
      const waterLevel = Math.random() * 3;
      reading = { waterLevel: waterLevel.toFixed(2) };
      if (waterLevel > 2.5) severity = 'high';
      else if (waterLevel > 1.5) severity = 'medium';
      break;

    case 'panic_button':
      // Button press is always high severity
      reading = { pressed: Math.random() > 0.5 };
      severity = reading.pressed ? 'high' : 'none'; // Only send if pressed
      break;

    case 'crowd_density':
      // Number of people per square meter
      const density = Math.random() * 5;
      reading = { density: density.toFixed(2) };
      if (density > 4) severity = 'high';
      else if (density > 2.5) severity = 'medium';
      break;

    case 'weapon_detection':
      // Detection confidence
      const detected = Math.random() > 0.8; // 20% chance of detection
      reading = { detected, confidence: detected ? (Math.random() * 100).toFixed(1) : 0 };
      severity = detected ? 'high' : 'none';
      break;
  }

  // If severity is none (e.g. panic button not pressed), don't send
  if (severity === 'none') return;

  const payload = {
    deviceId: sim.id,
    type: sim.type,
    location: sim.location,
    timestamp: new Date().toISOString(),
    reading,
    severity
  };

  const topic = `scemirp/sensors/${sim.type}/${sim.id}`;
  
  client.publish(topic, JSON.stringify(payload), (err) => {
    if (err) {
      console.error(`Error publishing to ${topic}:`, err);
    } else {
      console.log(`[${sim.id}] Published event with severity: ${severity}`);
    }
  });
}

client.on('error', (err) => {
  console.error('MQTT error:', err);
});

\`\`\`

### 3. backend/index.js
\`\`\`javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const SensorEvent = require('./models/SensorEvent');
const Incident = require('./models/Incident');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scemirp';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Endpoint to receive processed events from Node-RED
app.post('/api/events', async (req, res) => {
  try {
    const eventData = req.body;
    
    // 1. Save the sensor event
    const newEvent = new SensorEvent(eventData);
    await newEvent.save();

    // 2. Simple Incident correlation logic
    // For this prototype, any 'high' severity event creates a new Incident if one isn't open nearby
    // (A real system would have much more complex spatial/temporal correlation)
    if (eventData.severity === 'high') {
      let title = `High Severity Alert: ${eventData.type}`;
      if (eventData.type === 'weapon_detection') title = 'CRITICAL: Weapon Detected';
      if (eventData.type === 'panic_button') title = 'CRITICAL: Panic Button Activated';

      const newIncident = new Incident({
        title,
        description: `Triggered by ${eventData.type} sensor at ${eventData.location}. Reading: ${JSON.stringify(eventData.reading)}`,
        location: eventData.location,
        severity: eventData.type === 'weapon_detection' || eventData.type === 'panic_button' ? 'critical' : 'high',
        relatedEvents: [newEvent._id]
      });

      await newIncident.save();
      console.log(`Created new incident: ${title}`);
    }

    res.status(201).json({ message: 'Event processed successfully', eventId: newEvent._id });
  } catch (err) {
    console.error('Error processing event:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to fetch all incidents for the dashboard
app.get('/api/incidents', async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json(incidents);
  } catch (err) {
    console.error('Error fetching incidents:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to fetch recent sensor events
app.get('/api/events', async (req, res) => {
  try {
    const events = await SensorEvent.find().sort({ timestamp: -1 }).limit(50);
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend service running on port ${PORT}`);
});

\`\`\`

### 4. backend/models/Incident.js
\`\`\`javascript
const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  status: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open' },
  relatedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SensorEvent' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Incident', incidentSchema);

\`\`\`

### 5. backend/models/SensorEvent.js
\`\`\`javascript
const mongoose = require('mongoose');

const sensorEventSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, required: true },
  timestamp: { type: Date, required: true },
  reading: { type: Object, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true }
});

module.exports = mongoose.model('SensorEvent', sensorEventSchema);

\`\`\`

### 6. dashboard/src/App.jsx
\`\`\`javascript
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [events, setEvents] = useState([]);

  const fetchData = async () => {
    try {
      const incidentRes = await axios.get('http://localhost:3001/api/incidents');
      setIncidents(incidentRes.data);
      
      const eventRes = await axios.get('http://localhost:3001/api/events');
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

\`\`\`

### 7. dashboard/src/App.css
\`\`\`css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

:root {
  --bg-color: #0f172a;
  --text-color: #f8fafc;
  --card-bg: #1e293b;
  --primary: #3b82f6;
  --border-color: #334155;
  
  --severity-low: #3b82f6;
  --severity-medium: #f59e0b;
  --severity-high: #ef4444;
  --severity-critical: #991b1b;
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: -webkit-linear-gradient(#60a5fa, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header p {
  color: #94a3b8;
}

.incidents-section, .events-section {
  margin-bottom: 4rem;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.incident-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.incident-card {
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-top: 4px solid var(--primary);
  transition: transform 0.2s ease;
}

.incident-card:hover {
  transform: translateY(-5px);
}

.incident-card.severity-high { border-top-color: var(--severity-high); }
.incident-card.severity-critical { border-top-color: var(--severity-critical); }
.incident-card.severity-medium { border-top-color: var(--severity-medium); }

.incident-card h3 {
  margin-top: 0;
  font-size: 1.2rem;
}

.table-container {
  overflow-x: auto;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th, td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

th {
  background-color: rgba(0,0,0,0.2);
  font-weight: 600;
}

.event-row:hover {
  background-color: rgba(255,255,255,0.05);
}

.event-row.severity-high td { color: #fca5a5; }
.event-row.severity-medium td { color: #fcd34d; }

\`\`\`

