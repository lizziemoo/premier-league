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

2. **Install dependencies**:// ...existing code...

// TODO: Move API key to a secure location before deploying or sharing your code!
const API_KEY = '49925a6d517b4721ac4e5d9341193a48';

// Example usage in a fetch request:
fetch('https://api.football-data.org/v2/competitions/PL/matches', {
    headers: { 'X-Auth-Token': API_KEY }
})
.then(response => response.json())
.then(data => {
    // Handle the data
})
.catch(error => {
    console.error('Error fetching data:', error);
});

// ...existing code...// ...existing code...

// TODO: Move API key to a secure location before deploying or sharing your code!
const API_KEY = '49925a6d517b4721ac4e5d9341193a48';

// Example usage in a fetch request:
fetch('https://api.football-data.org/v2/competitions/PL/matches', {
    headers: { 'X-Auth-Token': API_KEY }
})
.then(response => response.json())
.then(data => {
    // Handle the data
})
.catch(error => {
    console.error('Error fetching data:', error);
});

// ...existing code...
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install
   ```

3. **API Key**:
   Sign up at [football-data.org](https://www.football-data.org/) to get your API key.

    **For security, do not hardcode your API key in your source files.**
   
   1. Create a file named `.env` in the project root (this file should **NOT** be committed to version control).
   2. Add your API key to the `.env` file like this:
      ```
      FOOTBALL_DATA_API_KEY=your_api_key_here
      ```
   3. Install the [`dotenv`](https://www.npmjs.com/package/dotenv) package:
      ```bash
      npm install dotenv
      ```
   4. At the top of your Node.js entry file (e.g., `main.js`), add:
      ```javascript
      require('dotenv').config();
      const apiKey = process.env.FOOTBALL_DATA_API_KEY;
      ```
   5. Use `apiKey` in your API requests.
   
   If you are using only client-side JavaScript, consider setting up a simple backend proxy to keep your API key secret.
   
   **Add `.env` to your `.gitignore` file:**
   ```
   # .gitignore
   .env
   ```

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