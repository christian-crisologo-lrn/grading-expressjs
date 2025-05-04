# Learnosity Grading App

A simple Express.js application that integrates with Learnosity's Grading API to facilitate the grading of student assessments.

## Overview

This application provides a web interface for graders to:
- View and grade student assessment items
- Save grading results
- Manage grading sessions

The app uses Learnosity's Grading API to handle the assessment rendering and grading functionality.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Learnosity account with API access

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/learnosity-grading-app.git
   cd learnosity-grading-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Learnosity credentials:
   ```
   LEARNOSITY_CONSUMER_KEY=your_consumer_key
   LEARNOSITY_CONSUMER_SECRET=your_consumer_secret
   LEARNOSITY_GRADER_ID=your_grader_id
   LEARNOSITY_GRADE_SESSION_ID=your_grade_session_id
   LEARNOSITY_ITEMS=item1,item2,item3
   LEARNOSITY_STUDENT_ID=student_id
   LEARNOSITY_ASSESS_SESSION_ID=assess_session_id
   PORT=3000
   ```

4. Start the application:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

### Configuration Panel

The app provides a configuration panel where you can:
- Enter your Learnosity credentials
- Specify the grader ID and session ID
- List the items to be graded

### Grading Interface

Once configured, the app will:
1. Load the Learnosity Grading API
2. Fetch the specified items
3. Render them in the grading interface
4. Allow you to grade each item and save your results

### Toggle Panels

Use the toggle buttons to show/hide different sections of the interface:
- Configuration panel
- Item attachment panel
- Individual items

## Project Structure

```
learnosity-grading-app/
├── app.js                  # Main Express application
├── public/                 # Static assets
│   ├── js/
│   │   ├── global.js       # Global configuration and utilities
│   │   ├── learnosity-grading.js # Learnosity integration
│   │   └── toggle.js       # UI toggle functionality
│   └── css/                # Stylesheets
├── views/                  # Handlebars templates
│   ├── layouts/
│   │   └── main.hbs        # Main layout template
│   ├── partials/           # Reusable template parts
│   └── index.hbs           # Main page template
└── .env                    # Environment variables
```

## API Documentation

This application uses the Learnosity Grading API. For detailed information about the API methods and parameters, refer to the [official Learnosity Grading API documentation](https://help.learnosity.com/hc/en-us/articles/19987818764445-gradingApp-Grading-API).

## Troubleshooting

### Common Issues

- **API Connection Errors**: Ensure your Learnosity credentials are correct in the `.env` file
- **Items Not Loading**: Verify that the item references exist in your Learnosity account
- **Saving Issues**: Check that the grader ID and session ID are valid

### Debug Mode

To enable debug logging, add the following to your `.env` file:
```
DEBUG=true
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.