# Backend Architecture Documentation

## Table of Contents
1. [Overall Structure](#overall-structure)
2. [Authentication vs Authorization](#authentication-vs-authorization)
3. [User API Overview](#user-api-overview)
4. [Request Flow Diagram](#request-flow-diagram)
5. [Complete DELETE Request Example](#complete-delete-request-example)
6. [Middleware Explanation](#middleware-explanation)

---

## Overall Structure

Our backend follows the **MVC (Model-View-Controller)** pattern with additional middleware layers:

```
backend/
├── config/
│   └── db.ts              # Database connection configuration
├── models/
│   └── User.ts            # User data model (Sequelize)
├── controllers/
│   └── userController.ts  # Business logic for User operations
├── routes/
│   └── userRoute.ts       # API endpoint definitions
├── middleware/
│   ├── auth.ts            # JWT authentication middleware
│   └── authorize.ts       # Role-based authorization middleware
└── server.ts              # Express app setup & entry point
```

### Component Responsibilities

| Component | Responsibility | Example |
|-----------|---------------|---------|
| **Models** | Define data structure, database schema, and data validation | User model with fields like id, username, email, role |
| **Controllers** | Business logic, process requests, interact with models | getAllUsers(), getUserById(), deleteUser() |
| **Routes** | Map HTTP methods to controller functions, apply middleware | `GET /api/v1/users` → getAllUsers controller |
| **Middleware** | Pre-process requests (authentication, authorization, validation) | Check JWT token, verify user role |
| **Config** | Application configuration (database, environment variables) | Sequelize connection to MySQL |

---

## Authentication vs Authorization

### Authentication (auth.ts)
**Question:** "Who are you?"
- Verifies the user's identity
- Checks if the JWT token is valid
- Confirms the user exists in the database
- Adds user info to the request object

**Example:**
```
User sends JWT token → Middleware verifies token → Extracts user ID from token →
Confirms user exists → Attaches user info to req.user
```

### Authorization (authorize.ts)
**Question:** "What are you allowed to do?"
- Checks if the authenticated user has permission for this action
- Based on user role (PM, LM, Staff)
- Can also check resource ownership

**Example:**
```
Authenticated user wants to delete user #5 → Check if user is admin (PM/LM) →
If yes, allow; if no, deny
```

### Key Difference

| Aspect | Authentication | Authorization |
|--------|---------------|---------------|
| Purpose | Verify identity | Verify permissions |
| When | First (always runs first) | Second (after authentication) |
| Question | "Who are you?" | "Can you do this?" |
| Output | req.user = {id, role} | Allow or deny the action |
| Error | 401 Unauthorized | 403 Forbidden |

---

## User API Overview

### Available Endpoints

```
GET    /api/v1/users          Get all users (Admin only)
GET    /api/v1/users/:id      Get specific user (Owner or Admin)
DELETE /api/v1/users/:id      Delete user (Admin only, cannot delete self)
```

### User Roles

| Role | Level | Permissions |
|------|-------|-------------|
| **PM** (Project Manager) | Admin | Full access to all resources |
| **LM** (Line Manager) | Admin | Full access to all resources |
| **Staff** | Regular User | Can only access their own resources |

### Authorization Rules Summary

| Endpoint | PM | LM | Staff | Notes |
|----------|----|----|-------|-------|
| GET /users | ✅ | ✅ | ✅   |            Admin only |
| GET /users/:id | ✅ | ✅ | ✅         (own only) | Owner or admin |
| DELETE /users/:id | ✅ | ✅ | ❌ |.    Admin only, cannot delete self |

---

## Request Flow Diagram

### High-Level Flow
```
┌─────────────┐
│   Client    │
│ (Frontend)  │
└──────┬──────┘
       │ HTTP Request + JWT Token
       │ (Headers: Authorization: Bearer <token>)
       ▼
┌─────────────────────────────────────────┐
│          Express Server                  │
│                                          │
│  1. Route Handler                        │
│     └─ Matches URL pattern               │
│                                          │
│  2. Authentication Middleware (auth.ts)  │
│     ├─ Extract JWT token                 │
│     ├─ Verify token signature            │
│     ├─ Check user exists                 │
│     ├─ Check account is active           │
│     └─ Attach req.user = {id, role}      │
│                                          │
│  3. Authorization Middleware             │
│     ├─ Check user role                   │
│     ├─ Check resource ownership          │
│     └─ Allow or deny                     │
│                                          │
│  4. Controller Function                  │
│     ├─ Execute business logic            │
│     ├─ Query database via Model          │
│     └─ Format response                   │
│                                          │
└───────────────┬─────────────────────────┘
                │
                ▼
         ┌─────────────┐
         │   Database  │
         │   (MySQL)   │
         └─────────────┘
                │
                ▼
         Response sent back to client
```

---

## Complete DELETE Request Example

### Scenario: PM User Deletes User #5

```
DELETE /api/v1/users/5
Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Authenticated User: { id: 1, role: 'PM' }
```

### Step-by-Step Flow

#### 1. Request Arrives at Server
```javascript
// Express receives the request
DELETE /api/v1/users/5
```

#### 2. Route Matching (routes/userRoute.ts)
```javascript
router.route('/:id')
  .delete(authenticate, authorizeAdmin, preventSelfDelete, deleteUser);
```
The request matches this route pattern. Express will now run the middleware chain in order.

#### 3. Middleware Chain Execution

**Middleware #1: `authenticate` (auth.ts)**
```javascript
Purpose: "Who are you?"
Input:  Authorization header with JWT token
Process:
  1. Extract token from header: "Bearer eyJhbGc..."
  2. Verify token using JWT_SECRET
  3. Decode token payload: { id: 1, role: 'PM', iat: 1234567890 }
  4. Query database: SELECT * FROM users WHERE id = 1
  5. Check user exists: ✓ Found
  6. Check if account active (endDate): ✓ Active
  7. Attach to request: req.user = { id: 1, role: 'PM' }
  8. Call next() to proceed

Output: req.user = { id: 1, role: 'PM' }
Status: ✅ PASS - User authenticated successfully
```

**Middleware #2: `authorizeAdmin` (authorize.ts)**
```javascript
Purpose: "Can you perform admin actions?"
Input:  req.user = { id: 1, role: 'PM' }
Process:
  1. Check if req.user exists: ✓ Yes
  2. Check if role is 'PM' or 'LM': ✓ Yes (role is 'PM')
  3. Call next() to proceed

Output: None (just allows request to continue)
Status: ✅ PASS - User is admin
```

**Middleware #3: `preventSelfDelete` (authorize.ts)**
```javascript
Purpose: "Are you trying to delete yourself?"
Input:
  - req.user.id = 1 (authenticated user)
  - req.params.id = "5" (target user to delete)
Process:
  1. Convert req.params.id to number: 5
  2. Compare: user.id (1) === targetId (5)?
  3. Result: 1 !== 5, so it's NOT self-delete
  4. Call next() to proceed

Output: None (just allows request to continue)
Status: ✅ PASS - Not deleting self
```

**Controller: `deleteUser` (userController.ts)**
```javascript
Purpose: Execute the business logic to delete user
Input:  req.params.id = "5"
Process:
  1. Parse target user ID: 5
  2. Query database: SELECT * FROM users WHERE id = 5
  3. Check if user exists:
     - If NOT found → return 404 "User not found"
     - If found → proceed
  4. Delete from database: DELETE FROM users WHERE id = 5
  5. Return success response

Output:
  Status: 204 No Content
  (No body returned for successful DELETE)
Status: ✅ SUCCESS - User deleted
```

#### 4. Response Flow

```
Server → Client: HTTP 204 No Content
```

### Complete Timeline

```
Time  | Layer          | Action
------|----------------|------------------------------------------
T+0   | Client         | Sends DELETE request with JWT token
T+10  | Express        | Matches route pattern
T+20  | auth.ts        | Verifies JWT token
T+30  | auth.ts        | Checks user exists in DB
T+40  | auth.ts        | Attaches req.user, calls next()
T+50  | authorize.ts   | Checks if user is admin (PM/LM)
T+60  | authorize.ts   | Confirms admin status, calls next()
T+70  | authorize.ts   | Checks not deleting self
T+80  | authorize.ts   | Confirms different user, calls next()
T+90  | Controller     | Finds user #5 in database
T+100 | Controller     | Deletes user #5 from database
T+110 | Controller     | Sends 204 response
T+120 | Client         | Receives 204 No Content
```

### Error Scenarios

#### Scenario A: Invalid Token
```
T+20: auth.ts detects invalid token
→ Return 401 Unauthorized: "Invalid token. Please log in again."
→ STOP (next middleware never runs)
```

#### Scenario B: Staff User Tries to Delete
```
Request from: { id: 10, role: 'Staff' }
T+60: authorize.ts checks role
→ role is 'Staff' (not PM or LM)
→ Return 403 Forbidden: "You don't have permission to perform this action"
→ STOP (controller never runs)
```

#### Scenario C: Admin Tries to Delete Themselves
```
Request from: { id: 5, role: 'PM' }
Target: /api/v1/users/5
T+80: preventSelfDelete middleware
→ req.user.id (5) === req.params.id (5)
→ Return 403 Forbidden: "You cannot delete your own account"
→ STOP (controller never runs)
```

#### Scenario D: User Not Found
```
Request: DELETE /api/v1/users/999
T+90: Controller queries database
→ User with id 999 doesn't exist
→ Return 404 Not Found: "User not found"
```

---

## Middleware Explanation

### Execution Order

Middleware runs in the **exact order** specified in the route definition:

```javascript
router.delete('/:id', authenticate, authorizeAdmin, preventSelfDelete, deleteUser);
                      ↑            ↑               ↑                    ↑
                      1st          2nd             3rd                  4th (controller)
```

**Key Rule:** If any middleware sends a response (res.status().json()), the chain STOPS.
Subsequent middleware and the controller never run.

### 1. authenticate (auth.ts)

**Purpose:** Verify user identity via JWT token

**What it does:**
- Extracts JWT token from `Authorization` header
- Verifies token is valid and not expired
- Decodes token to get user ID and role
- Queries database to ensure user still exists
- Checks if user account is active (not past endDate)
- Attaches user info to `req.user`

**Modifies Request:**
```javascript
req.user = {
  id: 1,
  role: 'PM'
}
```

**Success:** Calls `next()` to continue to next middleware

**Failure Responses:**
- 401: "No token provided" (missing token)
- 401: "Invalid token" (token verification failed)
- 401: "Token expired" (expired token)
- 401: "User no longer exists" (user deleted from DB)
- 401: "User account has been deactivated" (past endDate)

---

### 2. authorizeAdmin (authorize.ts)

**Purpose:** Ensure user has admin role (PM or LM)

**What it does:**
- Checks if `req.user` exists (authentication passed)
- Checks if user role is 'PM' or 'LM'
- Allows request to proceed if admin

**Reads from Request:**
```javascript
req.user.role  // 'PM', 'LM', or 'Staff'
```

**Success:** Calls `next()` to continue

**Failure Response:**
- 403: "You don't have permission to perform this action" (if Staff role)

---

### 3. authorizeOwnerOrAdmin (authorize.ts)

**Purpose:** Allow access if user is admin OR accessing their own resource

**What it does:**
- Checks if user is admin (PM or LM) → allow
- OR checks if user ID matches resource ID → allow
- Otherwise deny

**Reads from Request:**
```javascript
req.user.id        // Authenticated user's ID
req.user.role      // User's role
req.params.id      // Target user ID from URL
```

**Use Case:** For `GET /api/v1/users/:id`
- Staff user can view their own profile
- Admins can view any profile

**Success:** Calls `next()`

**Failure Response:**
- 403: "You don't have permission to access this resource"

---

### 4. preventSelfDelete (authorize.ts)

**Purpose:** Prevent users from deleting their own account

**What it does:**
- Compares authenticated user ID with target user ID
- Denies if they match (self-delete attempt)
- Allows if different users

**Reads from Request:**
```javascript
req.user.id        // Authenticated user: 1
req.params.id      // Target to delete: "5"
```

**Logic:**
```javascript
if (req.user.id === parseInt(req.params.id)) {
  // DENY - trying to delete yourself
} else {
  // ALLOW - deleting someone else
}
```

**Success:** Calls `next()`

**Failure Response:**
- 403: "You cannot delete your own account"

---

### Middleware Chain Summary Table

| Middleware | Runs On | Checks | Success | Failure | Error Code |
|------------|---------|--------|---------|---------|------------|
| authenticate | All protected routes | JWT token valid, user exists, account active | Adds req.user | Stops chain | 401 |
| authorizeAdmin | Admin-only routes | User role is PM or LM | Continues | Stops chain | 403 |
| authorizeOwnerOrAdmin | Owner/admin routes | Is admin OR is resource owner | Continues | Stops chain | 403 |
| preventSelfDelete | DELETE user route | User not deleting themselves | Continues | Stops chain | 403 |

---

## HTTP Status Codes Used

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | GET requests that return data |
| 204 | No Content | Successful DELETE (no response body) |
| 401 | Unauthorized | Authentication failed (invalid/missing token) |
| 403 | Forbidden | Authenticated but not authorized (wrong role/permissions) |
| 404 | Not Found | Resource doesn't exist (user not found) |
| 500 | Internal Server Error | Unexpected server error |

---

## Key Concepts to Explain to Alex

### 1. Middleware is Like Security Checkpoints
Think of middleware like airport security:
- **Checkpoint 1 (authenticate):** Check your ID is valid
- **Checkpoint 2 (authorizeAdmin):** Check you have business class ticket
- **Checkpoint 3 (preventSelfDelete):** Check you're not doing something dangerous
- **Gate (controller):** Finally board the plane (do the actual action)

If you fail ANY checkpoint, you get stopped and sent back. You never reach the next checkpoint.

### 2. req.user is How We Pass Information
Once authentication succeeds, it attaches user info to the request:
```javascript
req.user = { id: 1, role: 'PM' }
```
All subsequent middleware and controllers can read this to know who made the request.

### 3. next() is Like a Relay Race
Each middleware has the baton (the request). When done, it calls `next()` to pass the baton to the next runner (middleware). If a middleware doesn't call `next()`, the race stops.

### 4. Order Matters!
```javascript
// CORRECT ✓
router.delete('/:id', authenticate, authorizeAdmin, deleteUser);

// WRONG ✗ - Authorization before authentication
router.delete('/:id', authorizeAdmin, authenticate, deleteUser);
// This fails because authorizeAdmin needs req.user which authenticate provides
```

### 5. 401 vs 403
- **401 Unauthorized:** "I don't know who you are" (authentication failed)
- **403 Forbidden:** "I know who you are, but you can't do this" (authorization failed)

---

## Testing the API

### Example: Valid Admin Delete Request
```bash
curl -X DELETE http://localhost:3000/api/v1/users/5 \
  -H "Authorization: Bearer <valid-pm-token>"

Response: 204 No Content
```

### Example: Staff Trying to Delete (Should Fail)
```bash
curl -X DELETE http://localhost:3000/api/v1/users/5 \
  -H "Authorization: Bearer <staff-token>"

Response: 403 Forbidden
{
  "status": "error",
  "message": "You don't have permission to perform this action"
}
```

### Example: Self-Delete Attempt (Should Fail)
```bash
# PM user with id=3 tries to delete themselves
curl -X DELETE http://localhost:3000/api/v1/users/3 \
  -H "Authorization: Bearer <pm-id-3-token>"

Response: 403 Forbidden
{
  "status": "error",
  "message": "You cannot delete your own account"
}
```

---

## Questions for Alex?

After reading this, ask Alex:
1. Can you explain the difference between authentication and authorization?
2. What would happen if a Staff user tried to access `GET /api/v1/users`?
3. In what order do the middleware run for `DELETE /api/v1/users/5`?
4. Why do we need `preventSelfDelete` middleware?
5. What's the difference between a 401 and 403 error?
