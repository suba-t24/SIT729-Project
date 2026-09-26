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
