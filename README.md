# Overview

Web application focused on cataloging a user's reading. It allows users to search its database for books by title, author, or category. For each book, there is a page with detailed information. Users can add books to their reading lists (Want to Read, Reading, Read) in order to keep track of all their readings. They can also write reviews on books of their choosing, which are then shared with other users when they visit the book's page. Furthermore, users can participate in the rating of a book, from 0 to 5, which will contribute to the overall rating of the book.

# Preview

https://www.youtube.com/watch?v=q-9vhGb8H20

<img width="1440" alt="Screenshot 2024-05-13 at 22 38 35" src="https://github.com/marsRocha/book-tracker-app/assets/25842353/4a387abc-882f-4ae9-80dd-04433fb371a4">

# How to run the application:

#### Requirements: `Python, Node`

## Backend

### 1. Go to the root folder and perform the following commands:

`cd backend/`

### 2. Create and activate the virtual environment

```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install required packages

```bash
pip install -r requirements.txt
```

### 4. Run the server

```bash
python manage.py migrate
python manage.py runserver
```

## Frontend

- Head back to the root folder
- Enter in `cd frontend/`

### 1. Installing packages

```bash
yarn
```

<details><summary>If you don't have yarn installed</summary>
<p>

```bash
npm i
```

> Remove **yarn.lock** as you will already have **package.lock**

</p>
</details>

### 2. Run the application

```bash
yarn start # OR npm run start
```

> Make sure both frontend and backend are running.

# Additional information
The requirements.txt file, containing the Python packages, is stored inside the backend folder.
