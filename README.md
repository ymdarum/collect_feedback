# Project Title

A brief description of your project, its purpose, and what it does.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Database Setup](#database-setup)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Feedback Submission**: Users can submit feedback through a structured form.
- **Dynamic Division and Venue Management**: Admins can add, update, and delete divisions and venues.
- **Feedback Session Management**: Admins can view, edit, and delete feedback sessions.
- **Data Visualization**: (If applicable) Visual representation of feedback data.
- **Responsive Design**: The application is designed to work on various devices.

## Technologies Used

- **Frontend**: React, Next.js, Material-UI
- **Backend**: Flask, MySQL
- **Others**: Axios, dotenv, etc.

## Installation

1. **MySQL Requirement**: Ensure you have MySQL installed on your machine. You can download it from [MySQL's official website](https://www.mysql.com/downloads/).

2. Clone the repository:
   ```bash
   git clone https://github.com/ymdarum/collect_feedback.git
   ```

3. Navigate to the project directory:
   ```bash
   cd collect_feedback
   ```

4. Install the backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

5. Install the frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Database Setup

Before running the application, you need to set up the database and tables:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the `setup_db.py` script to create the database and tables:
   ```bash
   python setup_db.py
   ```

## Usage

1. Start the backend server:
   ```bash
   cd backend
   python app.py
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

## API Endpoints

- **GET** `/api/divisions` - Retrieve all divisions
- **GET** `/api/venues` - Retrieve all venues
- **POST** `/api/submit-feedback` - Submit feedback
- **PUT** `/api/admin/feedback-session/<session_id>` - Update a feedback session
- **DELETE** `/api/admin/feedback-session/<session_id>` - Delete a feedback session

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
