# 4.2D Project Status Update: Smart City Emergency Monitoring and Incident Response Platform (SCEMIRP)

**Student Name:** Subathira Thinakaran
**Student ID:** 225094537
**Date of Submission:** 05-09-2026
**Document Version:** 1.0

---

## 1. Executive Summary

This document provides a comprehensive status update on the development of the Smart City Emergency Monitoring and Incident Response Platform (SCEMIRP). The project aims to design, build, and deploy a scalable Internet of Things (IoT) solution that integrates multiple sensor types to monitor public safety and environmental conditions in smart cities. 

Since the submission of the 1.2D Project Proposal, significant progress has been made in establishing the core foundation of the platform. Following the marker's feedback to incrementally add functionality as it is covered in the unit, the project has successfully implemented the local development environment comprising IoT simulators, message brokering, event processing, database storage, and a real-time web dashboard.

## 2. Project Progress Against Schedule

The project is currently tracking well against the proposed schedule. Below is a detailed breakdown of the completed and upcoming milestones.

### Completed Activities (Weeks 1 - 4, 6 & 7)
*   **Week 1: Requirements and Architecture Finalisation:** The system architecture was formalised, adopting a containerised microservices approach using Docker to ensure portability and scalability.
*   **Week 2: IoT Simulators and MQTT Configuration:** Node.js-based simulators were developed to mimic real-world sensors (Smoke, Weather, Flood, Panic Button, Crowd Density, and Visible-Weapon Detection). An Eclipse Mosquitto MQTT broker was configured to handle the publish-subscribe messaging model.
*   **Week 3: Node-RED Workflows:** A Node-RED instance was deployed and configured to ingest raw sensor data from the MQTT broker, validating and routing the data to the backend application programming interfaces (APIs).
*   **Week 4: Microservices and MongoDB:** An Express.js backend microservice was developed to handle incident correlation and management. A MongoDB instance was set up to persistently store sensor events and generated incidents.
*   **Week 6: Monitoring Dashboard (Brought Forward):** Development of the React-based monitoring dashboard was brought forward to facilitate immediate visualisation of the end-to-end data flow. The dashboard successfully fetches and displays real-time incidents and sensor events.
*   **Week 7: Functional and Integration Testing:** Comprehensive local testing was conducted to resolve defects in the event correlation logic and ensure robust error handling across all Docker containers.

### Current & Upcoming Activities (Weeks 5, 8 & 9)
*   **Week 5 (Delayed) & 8: AWS Cloud Deployment and Scalability Testing:** Deployment to AWS was temporarily delayed while waiting for university access to the AWS Academy Learner Lab. Having just received access, we are currently in Week 8, migrating the Docker Compose architecture to an Amazon EC2 instance. Once deployed, the system will be subjected to high-volume simulated data to evaluate performance metrics.
*   **Week 9: Final Documentation:** Preparation of the final project report and demonstration materials.

## 3. Technical Implementation Details

### 3.1 Infrastructure and Orchestration
To ensure consistency across development and production environments, the entire platform has been containerised. A `docker-compose.yml` file was created to orchestrate the following services:
*   `mqtt`: Eclipse Mosquitto (Port 1883)
*   `mongodb`: MongoDB 6.0 (Port 27017)
*   `node-red`: Node-RED (Port 1880)
*   `backend`: Node.js Express API (Port 3001)
*   `simulators`: Node.js Synthetic Data Generator
*   `dashboard`: React + Vite Frontend (Port 5173)

### 3.2 IoT Simulators
A dedicated Node.js application was written to simulate the six distinct sensor types outlined in the proposal. The simulator connects to the Mosquitto broker via the `mqtt` library and publishes JSON payloads at configurable intervals. 

```javascript
// Example Payload Structure
{
  "deviceId": "smoke-01",
  "type": "smoke",
  "location": "Building A, Floor 2",
  "timestamp": "2026-09-05T08:00:00.000Z",
  "reading": { "level": "65.50", "unit": "ppm" },
  "severity": "medium"
}
```

### 3.3 Backend Microservice
The backend service was built using Express.js and Mongoose. It exposes RESTful APIs for Node-RED to push processed events (`POST /api/events`) and for the dashboard to pull current status (`GET /api/incidents`). Basic spatial and temporal correlation logic has been implemented, where critical events (e.g., weapon detection or panic button activation) automatically generate high-severity incident records.

### 3.4 Web Dashboard
A modern, responsive web dashboard was created using React and Vite. It features a premium dark-mode aesthetic utilizing CSS variables and the Inter font family. The dashboard automatically polls the backend APIs and dynamically renders active incidents in a grid layout, alongside a tabular view of recent raw sensor events.

## 4. Challenges and Mitigation Strategies

During the implementation phase, a few challenges were encountered:
1.  **Asynchronous Data Flow Debugging:** Tracing data from the simulators through MQTT, Node-RED, and finally to the database proved challenging. This was mitigated by adding extensive logging at each integration point and utilising Node-RED's built-in debug nodes.
2.  **Cross-Origin Resource Sharing (CORS):** The React frontend initially failed to communicate with the Express backend due to CORS restrictions. This was swiftly resolved by configuring the `cors` middleware in the Express application to accept requests from the dashboard's origin.

## 5. Alignment with Unit Learning Outcomes

The development of the SCEMIRP platform closely aligns with the theoretical topics covered in the unit thus far:
*   **Scalability in IoT & MicroServices Architecture:** The platform is decoupled into independent microservices (simulators, broker, Node-RED, backend, frontend) using Docker. This layered architecture ensures that individual components can be scaled independently, laying the groundwork for cloud-based auto-scaling.
*   **Devices and Platforms for Scalable IoT:** The Node.js simulators act as software-defined edge devices, seamlessly integrating with the central processing platform.
*   **IoT Connectivity Technologies:** Eclipse Mosquitto implements MQTT, providing lightweight, scalable publish-subscribe connectivity tailored for constrained IoT networks.
*   **Smart Platforms and Node-RED:** Node-RED is utilized as the intelligent middleware layer, routing and validating MQTT streams before forwarding them to the application layer.
*   **IoT and BigData:** MongoDB (NoSQL) was selected over relational databases to efficiently ingest and store the high-volume, unstructured JSON telemetry generated by the simulated devices.
*   **Event-Driven IoT Architecture:** The entire system is built on an event-driven paradigm. Data flows from sensor generation to MQTT publication, Node-RED reaction, and backend incident creation without synchronous polling.

## 6. Conclusion and Next Steps

The SCEMIRP project is progressing highly satisfactorily. The fundamental building blocks—data generation, messaging, processing, storage, and visualisation—have been successfully integrated and validated locally. 

The immediate next step is to transition this local architecture to the AWS cloud environment using the newly provisioned AWS Academy Learner Lab. Given the standard IAM constraints within the Learner Lab environment, the deployment strategy will utilize Amazon EC2. The containerised architecture will be migrated to an EC2 instance, where Docker Compose will orchestrate the services in the cloud, proving the system's viability in a production-like environment before final scalability testing.
