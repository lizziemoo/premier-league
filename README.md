# Premier League Live

This project is a web application that provides live updates for the Premier League (UK) including kick-off times, scores, goal scorers, red/yellow cards, goals, half-time, full-time, and a league table that updates in real-time.

## Project Structure

```
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
```

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd premier-league-live
   ```

2. **Install dependencies**:
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **API Key**:
   Sign up at [football-data.org](https://www.football-data.org/) to get your API key. You will need to include this key in your JavaScript code to fetch data.

4. **Run the application**:
   Open `src/index.html` in your web browser to view the live updates.

## Usage

The application will display:
- Current scores of ongoing matches
- A league table on the right side
- Additional match information at the bottom, including goal scorers and cards

## API Integration

This project uses the football-data.org API to fetch live match updates and league standings. The JavaScript code in `src/scripts/main.js` handles API requests and updates the DOM in real-time.

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements for the project.