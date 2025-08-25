
# Premier League Live (Synthwave Edition)

This project is a visually modern, synthwave-inspired web application that provides live updates for the Premier League, Championship, League One, and League Two. It features:
- Live scores, recent results, and upcoming fixtures
- Dynamic league table for each league
- Clickable matches for detailed stats and lineups
- Neon synthwave color palette and responsive card-based UI
- League logos in navigation and headings



## Project Structure

```
premier-league
├── index.html            # Main HTML document for the webpage
├── styles/
│   └── main.css          # Synthwave CSS theme and responsive layout
├── scripts/
│   └── main.js           # JavaScript for fetching live updates and UI logic
├── assets/               # League logos and images
├── server.js             # Node.js backend proxy for API-Football
├── package.json          # Configuration file for npm dependencies
├── .env                  # (Not committed) API key for API-Football
└── README.md             # Documentation for the project
```

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd premier-league
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```


3. **API Key**:
    - Sign up at [API-Football](https://dashboard.api-football.com/) to get your API key.
    - Create a file named `.env` in the project root (this file should **NOT** be committed to version control).
    - Add your API key to the `.env` file like this:
       ```
       API_FOOTBALL_KEY=your_api_key_here
       ```
    - The backend proxy (`server.js`) will use this environment variable to authenticate requests to API-Football.
    - **Add `.env` to your `.gitignore` file:**
       ```
       # .gitignore
       .env
       ```

4. **Run the backend proxy**:
   ```bash
   node server.js
   ```
   The backend will be available at `http://localhost:3000` (or the port specified in your environment).


5. **Run the frontend**:
   Open `index.html` in your web browser to view the live updates. The frontend fetches data from your backend proxy.

## Features

- **Synthwave Theme:** Neon pink, purple, and blue gradients, glowing accents, and a modern card-based layout.
- **Multi-League Support:** Switch between Premier League, Championship, League One, and League Two using the top navigation tabs, each with its own logo and color.
- **Live Data:** See current scores, recent results, upcoming fixtures, and league tables for each league.
- **Match Details:** Click any match to view a modal with the latest team stats and lineups.
- **Responsive Design:** Looks great on desktop and mobile.


## Usage

The application will display:
- Current scores of ongoing matches (or recent results if no live games)
- Upcoming fixtures in the center
- A league table on the right side
- Additional match information at the bottom, including goal scorers and cards
- League logos and synthwave highlights throughout the UI



## API Integration

This project uses a Node.js backend proxy (`server.js`) to securely fetch data from the [API-Football](https://dashboard.api-football.com/) API. The frontend JavaScript (`scripts/main.js`) fetches data from the backend endpoints and updates the DOM in real-time. All API keys are kept server-side for security.


## Data Source

This site uses [API-Football](https://www.api-football.com/) (Pro plan, Premier League, Championship, League One, League Two, season 2025/26) via a Node.js backend proxy. You must set the `API_FOOTBALL_KEY` environment variable with your Pro API key.

**Note:** The Pro API-Football plan is required for live and current season data (2025/26). Free plan users will only see historical data.


## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project. All feedback is welcome!