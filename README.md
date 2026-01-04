# ⚙️ LearnHub Server — Full-Stack LMS Backend

The backend API for **LearnHub**, built with **Node.js**, **Express**, and **MongoDB**. It handles user authentication, course management, enrollment processing, and secure role-based access control.

---

## 🚀 Key Features

*   **RESTful API:** Structured endpoints for Users, Courses, and Enrollments.
*   **Secure Authentication:** Middleware using **Firebase Admin SDK** to verify ID tokens.
*   **Role-Based Access Control (RBAC):** Middleware to verify `Admin` and `Instructor` roles.
*   **Database:** Scalable data modeling using **MongoDB**.
*   **CRUD Operations:** Full Create, Read, Update, Delete capabilities for core resources.

---

## 🛠️ Tech Stack

*   **Runtime:** [Node.js](https://nodejs.org/)
*   **Framework:** [Express.js](https://expressjs.com/)
*   **Database:** [MongoDB](https://www.mongodb.com/) (using Native Driver)
*   **Authentication:** [Firebase Admin](https://firebase.google.com/docs/admin/setup)
*   **Middleware:** CORS, Dotenv

---

## 🔌 API Endpoints

### 👤 Users
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--: |
| `GET` | `/users` | Get all users | 🔐 (Admin) |
| `GET` | `/users/:email` | Get single user profile | 🔐 |
| `POST` | `/users` | Create/Register a new user | 🔓 |
| `PATCH` | `/users/:email` | Update user profile (Name/Photo) | 🔐 |
| `PATCH` | `/users/:email/role` | Update user role (Admin/Instructor) | 🔐 (Admin) |
| `DELETE` | `/users/:email` | Delete a user | 🔐 (Admin) |

### 📚 Courses
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--: |
| `GET` | `/course` | Get all available courses | 🔓 |
| `GET` | `/course/:id` | Get details of a single course | 🔐 |
| `POST` | `/create-course` | Publish a new course | 🔐 (Instructor) |
| `PATCH` | `/course/:id` | Update an existing course | 🔐 (Instructor) |
| `DELETE` | `/course/:id` | Delete a course | 🔐 (Instructor) |

### 📝 Enrollments
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--: |
| `GET` | `/enrollments` | Get enrollments (filtered by user/role queries) | 🔐 |
| `POST` | `/enrollments` | Enroll a user in a course | 🔐 |

---

## ⚙️ Local Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/armanislams/learn-hub-server.git
    cd learn-hub-server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory:
    ```env
    DB_USER=your_mongodb_username
    DB_PASS=your_mongodb_password
    DB_URI=your_mongodb_cluster_uri
    PORT=5000
    ```
    *Note: Ensure your `firebase-service-account.json` (or similar) is present if using admin SDK initialized via file.*

4.  **Run the server:**
    ```bash
    npm start
    # OR for development with hot reload
    nodemon index.js
    ```

---

## 👥 Author
**Arman Islam**
- 🐙 [GitHub](https://github.com/armanislams)
