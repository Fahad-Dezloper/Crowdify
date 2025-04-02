# Crowdify - Collaborative Music Streaming Platform

Crowdify is a real-time music streaming platform where users can create rooms, invite others to join, add songs, and upvote tracks. The most upvoted song gets played automatically. It also features an AI chatbot for assistance and engagement.

## Features

- 🎵 **Create and Join Rooms**: Users can create rooms or join existing ones.
- 📌 **Add Songs**: Anyone in the room can add songs to the queue.
- 👍 **Upvote Songs**: The song with the highest votes plays next.
- 🤖 **Chat box**: Real Time chatbox.
- 🔄 **Real-time Updates**: WebSockets ensure instant updates on song queues and votes.

![image](https://github.com/user-attachments/assets/df99912c-3181-490b-8996-c47495fa93b6)


## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: https://github.com/Fahad-Dezloper/crowdify-backend [ REDIS, WEBSOCKET ]
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth / OAuth
- **Streaming API**: YouTube API

## Setup Instructions

Follow these steps to set up the frontend for CROWDIFY.

### Step 1: Fork and Clone the Repository
Fork the repository and then clone it to your local machine:
```sh
git clone https://github.com/Fahad-Dezloper/Crowdify
cd crowdify
```

### Step 2: Install Dependencies
Run the following command to install all necessary dependencies:
```sh
pnpm install
```

### Step 3: Update WebSocket Configuration
Navigate to `WebContext.tsx` and modify the WebSocket configuration as follows:

1. Comment out the existing WebSocket connection:
```ts
// const ws = new WebSocket("wss://crowdify-backend-production.up.railway.app");
```
2. Uncomment the local WebSocket connection:
```ts
const ws = new WebSocket("ws://localhost:4000");
```

### Step 4: Configure Environment Variables
Copy the example environment file and set up the necessary credentials:
```sh
cp .env.example .env
```
Then, update the `.env` file with your credentials:
```ini
# Google OAuth Credentials
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# YouTube API Key for searching YouTube videos on the dashboard
YOUTUBE_API_KEY=""

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000/"
NEXTAUTH_URL_INTERNAL="http://localhost:3000/"

# Generate a secure NEXTAUTH_SECRET using:
# openssl rand -base64 32
NEXTAUTH_SECRET=""

# Database Configuration
DATABASE_URL=""
```

### Step 5: Run Prisma Migrations
Apply database migrations using Prisma:
```sh
npx prisma migrate deploy
```

### Step 6: Generate Prisma Client
Run the following command to generate the Prisma client:
```sh
npx prisma generate
```

### Step 7: Follow the steps to run the backend
```sh
https://github.com/Fahad-Dezloper/crowdify-backend
```

### Step 8: Start the Frontend
Run the frontend development server:
```sh
pnpm run dev
```
Now, your frontend and backend should be up and running!

## Usage

1. Create a new room and invite others.
2. Add songs to the playlist.
3. Upvote songs to determine the next track.
4. Interact with the others through chatbox

## Contributing

Contributions are welcome! Feel free to fork the repo, make improvements, and submit a PR.

## License

This project is licensed under the MIT License.

---

🚀 **Enjoy collaborative music streaming with Crowdify!**
