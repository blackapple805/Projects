# 🧠 AI Network Dashboard

A real-time monitoring and alerting system that combines **AI-powered anomaly prediction**, **Prometheus metrics**, and **Grafana visualization**.  
Built with FastAPI, Docker, and Python.

---

## 🚀 Overview

The **AI Network Dashboard** predicts network spikes and latency issues using a trained ML model, exports metrics to Prometheus, and visualizes them in Grafana.  
It supports email alerts via SMTP or Grafana Cloud Alerting.

**Stack**
- FastAPI (Python backend)
- Prometheus (metrics collection)
- Grafana (visual dashboards + alerting)
- Docker Compose (container orchestration)

---

## 🧩 Project Structure

```
ai-network-dashboard/
├── app/
│   ├── main.py          # FastAPI app with /metrics endpoint
│   ├── model.py         # ML model training & prediction
│   ├── metrics.json     # Real-time metrics simulated or generated
│   ├── model.pkl        # Trained regression model
│
├── prometheus/
│   └── prometheus.yml   # Prometheus scrape config
│
├── docker-compose.yml   # Service definitions for app, Prometheus, Grafana
├── .env                 # Environment variables (ignored by git)
└── README.md            # You are here
```

---

## 🧠 Features

✅ AI-based latency and packet-loss prediction  
✅ Real-time Prometheus metrics scraping  
✅ Grafana dashboards with custom alert rules  
✅ Email alerting via Gmail SMTP or Grafana Cloud  
✅ Modular Docker setup with persistent Grafana data  

---

## ⚙️ Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/ai-network-dashboard.git
cd ai-network-dashboard
```

### 2️⃣ Configure Environment Variables
Create a `.env` file in the project root:
```bash
GF_SMTP_USER=your_email@gmail.com
GF_SMTP_PASSWORD=your_app_password
```
*(Ensure `.env` is in `.gitignore`)*

### 3️⃣ Start the Stack
```bash
docker compose up -d
```

### 4️⃣ Access the Services
| Service | URL | Notes |
|----------|-----|-------|
| FastAPI  | http://localhost:8000 | API + `/metrics` endpoint |
| Prometheus | http://localhost:9090 | Metric scraping |
| Grafana | http://localhost:3000 | Visualization & alerting |

---

## 🧾 Example Alert Rule (Grafana)

**Rule name:** High Spike Probability  
**Query:**  
```
node_spike_prob > 0.9
```
**Condition:** Alert when above threshold for 1 minute  
**Label:** `severity=high`  
**Notification:** Email via SMTP or Grafana Cloud  

---

## 🧰 Useful Commands

Stop stack (no data loss):
```bash
docker compose down
```

Rebuild stack:
```bash
docker compose up --build -d
```

Reset Grafana admin password:
```bash
docker exec -it grafana grafana-cli admin reset-admin-password admin
```

---

## 📊 Future Enhancements
- Add Loki for log correlation  
- Add AI model retraining via API endpoint  
- Add Grafana dashboard auto-provisioning  

---

## 🧑‍💻 Author
**Eric D. Angel (blackapple805)**  
💻 DevOps | AI Systems | Network Monitoring  
🔗 [QuestOne.Cloud](https://questone.cloud) | [Grafana Cloud](https://grafana.com/orgs/blackapple805)

---

## ⚠️ License
MIT License © 2025 Eric D. Angel
