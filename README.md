premier-league-live
├── src
│   ├── index.html          # Main HTML document for the webpage
│   ├── styles
│   │   └── main.css       # CSS styles implementing a dark mode color scheme
│   ├── scripts
│   │   └── main.js        # JavaScript code for fetching live updates from the API
│   └── assets             # Directory for additional assets (images/icons)
├── package.json           # Configuration file for npm dependencies
└── README.md              # Documentation for the project

# Premier League Live

This project is a web application that provides live updates for the Premier League (UK) including kick-off times, scores, goal scorers, red/yellow cards, goals, half-time, full-time, and a league table that updates in real-time.

## Project Structure

```
premier-league
├── index.html            # Main HTML document for the webpage
├── styles/
│   └── main.css          # CSS styles implementing a dark mode color scheme
├── scripts/
│   └── main.js           # JavaScript code for fetching live updates from the backend API
├── server.js             # Node.js backend proxy for football-data.org API
├── package.json          # Configuration file for npm dependencies
├── .env                  # (Not committed) API key for football-data.org
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

## Usage

The application will display:
- Current scores of ongoing matches (or recent results if no live games)
- Upcoming fixtures in the center
- A league table on the right side
- Additional match information at the bottom, including goal scorers and cards


## API Integration

This project uses a Node.js backend proxy (`server.js`) to securely fetch data from the [API-Football](https://dashboard.api-football.com/) API. The frontend JavaScript (`scripts/main.js`) fetches data from the backend endpoints and updates the DOM in real-time.

**Backend Endpoints:**
- `/api/matches` — Returns Premier League fixtures (live, recent, and upcoming)
- `/api/standings` — Returns the current Premier League table

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project.