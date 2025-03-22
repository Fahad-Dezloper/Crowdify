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

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/crowdify.git
   cd crowdify
   ```

2. Install dependencies:
   ```sh
   pnpm install
   ```

3. Set up environment variables in a `.env` file check `.env.example`:


4. Start the development server:
   ```sh
   pnpm run dev
   ```

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
