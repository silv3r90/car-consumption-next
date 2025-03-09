# KFZ-Stromverbrauchs-Dashboard

Ein modernes Dashboard zur Visualisierung und Verwaltung des KFZ-Stromverbrauchs, gebaut mit Next.js, Tailwind CSS und shadcn/ui.

## Eigenschaften

- **Modernes UI**: Entwickelt mit Next.js, Tailwind CSS und shadcn/ui
- **Responsives Design**: Optimiert für Desktop und mobile Geräte
- **Dashboard**: Visualisierung des KFZ-Stromverbrauchs und der Kosten
- **Admin-Bereich**: Hinzufügen und Bearbeiten von Verbrauchsdaten
- **Authentifizierung**: Schutz des Admin-Bereichs
- **Dark/Light Modus**: Unterstützt verschiedene Anzeigeoptionen

## Technologie-Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API-Routen
- **Datenbank**: MongoDB
- **Authentifizierung**: NextAuth.js
- **Diagramme**: Chart.js mit react-chartjs-2

## Entwicklung

### Voraussetzungen

- Node.js 18.x oder höher
- MongoDB-Instanz

### Installation

1. Repository klonen:
```bash
git clone https://github.com/silv3r90/car-consumption-next.git
cd car-consumption-next
```

2. Abhängigkeiten installieren:
```bash
npm install
```

3. Umgebungsvariablen konfigurieren:
```bash
cp .env.example .env.local
```
Anschließend die Werte in `.env.local` nach Bedarf anpassen.

4. Entwicklungsserver starten:
```bash
npm run dev
```

Die Anwendung ist dann unter http://localhost:3000 verfügbar.

## Bereitstellung

Diese Anwendung kann einfach auf Plattformen wie Vercel, Netlify oder mit Docker bereitgestellt werden.

### Docker

Um die Anwendung mit Docker zu betreiben:

1. Docker-Image erstellen:
```bash
docker build -t car-consumption-next .
```

2. Container starten:
```bash
docker run -p 3000:3000 -e MONGODB_URI=your_mongodb_uri car-consumption-next
```

## Nutzung

### Admin-Zugang

Der Standardzugang für den Admin-Bereich kann in den Umgebungsvariablen konfiguriert werden.

Standardmäßig:
- Benutzername: admin
- Passwort: sicheres_passwort

## Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.