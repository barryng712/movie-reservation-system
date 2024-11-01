# Movie Reservation Backend API

This is the backend system for a movie reservation service, which allows users to sign up, log in, browse movies, reserve seats for specific showtimes, and manage their reservations. The system also includes user authentication, movie and showtime management, seat reservation functionality, and reporting features.

Special thanks to the [Movie Reservation System](https://roadmap.sh/projects/movie-reservation-system) project on Roadmap.sh for inspiration.

## Features

* **User Authentication & Authorization**:
    * User registration and login using JSON Web Tokens (JWT).
    * Role-based access control: admin vs. regular user.

* **Movie Management**:
    * Admins can create, update, and delete movies.
    * Each movie has a title, description, genre, and poster image.

* **Showtime Management**:
    * Admins can create, update, and delete showtimes for each movie.
    * Users can browse available showtimes.

* **Reservation Management**:
    * Users can reserve seats for specific showtimes.
    * Users can view and cancel their reservations (only for upcoming showtimes).
    * Admins can view all reservations, seat capacity, and revenue reports.

## Tech Stack

* **Node.js**: JavaScript runtime for building the server-side application.
* **Express**: Web framework for Node.js.
* **Sequelize**: ORM for database management.
* **PostgreSQL**: Relational database.
* **JWT**: JSON Web Tokens for secure authentication.
* **bcrypt**: Library for hashing passwords.
* **dotenv**: Managing environment variables.
* **Nodemon**: Development tool for automatically restarting the server on code changes.


## Installation and Setup

### Prerequisites
* Node.js installed on your machine.
* MySQL or PostgreSQL database.

### Steps

1. **Clone the repository**:

    ```bash
    git clone https://github.com/JheyTim/Movie-Reservation-System.git
    cd Movie-Reservation-System
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Create a `.env` file** with your environment variables:

    ```bash
    touch .env
    ```

    Add the following variables:
    ```env
    PORT=3000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=movie_reservation
    JWT_SECRET=your_jwt_secret
    ```

4. **Create the Database Manually**: Before running the app, you need to create the movie_reservation database manually in MySQL (or PostgreSQL) since Sequelize only syncs tables and does not create the database itself.

    * Open your MySQL terminal or a MySQL client and run:
        ```sql
        CREATE DATABASE movie_reservation;
        ```

5. **Sync database schema**: Since migrations are not being used, Sequelize will automatically sync your models to the database tables. Ensure your database is up and running, and run the app:

    ```bash
    npm start
    ```

6. Test the API using Postman or any API client:

    * Sign up a new user.
    * Log in as a user to get a JWT token.
    * Use the token to make authorized requests (e.g., reserving seats, managing movies as an admin).

## API Endpoints

### Authentication
* POST /auth/register: Register a new user.
* POST /auth/login: Log in an existing user.
* POST /auth/logout: Logout

### Room
* POST /rooms/: Create a room. (Admin only).
* GET /rooms/: Get all rooms
* GET /rooms/:id :get room by id
* PATCH /rooms/:id: Update a room. (Admin only).

### Movies 
* POST /movies/: Create a new movie. (Admin only).
* GET /movies/: Get all movies
* GET /movies/:id :get movie by id
* PATCH /movies/:id: Update a movie. (Admin only).
* DELETE /movies/:id: Delete a movie. (Admin only).

### Showtimes
* GET /showtimes/: Get all showtimes
* POST /showtimes/: Create showtime (Admin only).
* GET /showtimes/:id : Get showtime by id
* PATCH /showtimes/:id: update showtime (Admin only).
* DELETE /showtimes/:id: delete showtime (admin only).
* GET /showtimes/:id/seats: get available seats.

### Reservations
* POST /reservations/: create a reservation.
* GET /reservations/: Fetch all reservations for the logged-in user.
* GET /reservations/: Fet all reservations for all users (admin only)
* DELETE /reservations/:id: Cancel a reservation.

### Admin Reports
* GET /revenues/: get revenue for all showtime (Admin only).
* GET /revenues/:id: get revenue for a specific showtime. (admin only).

## License
This project is licensed under the [MIT License](LICENSE).
