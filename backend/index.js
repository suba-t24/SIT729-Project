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
