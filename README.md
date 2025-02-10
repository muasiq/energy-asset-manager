# Enerzyz

A real-time energy asset management system with data visualization capabilities. This application allows you to generate, monitor, and analyze energy-related data using InfluxDB for time-series data storage.

## Features

- Real-time data visualization
- Multiple time window views (1h, 3h, 1d, 7d, since inception)
- Customizable data generation
- Anomaly detection
- Statistical analysis
- Responsive design

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- InfluxDB 2.x running locally or accessible URL

## Setup

1. **Clone the repository**

git clone https://github.com/yourusername/enerzyz.git
cd enerzyz

2. **Install dependencies**

npm install

3. **Environment Setup**

Copy the environment template:

cp .env.example .env.local


Update `.env.local` with your InfluxDB credentials:

NEXT_PUBLIC_INFLUXDB_TOKEN=your_token_here
NEXT_PUBLIC_INFLUXDB_URL=http://localhost:8086
NEXT_PUBLIC_INFLUXDB_ORG=your_org_here


4. **Start the development server**

npm run dev


