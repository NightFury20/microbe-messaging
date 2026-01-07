# Intro
I am not very happy with the state of this project. I took the opportunity to learn NextJS and Websockets, they seemed like the clear choice for the requirements, but took much more time than expected to learn.

This is also just not enough time to build a project properly, I've had to cut a lot of corners, and live with a implementation I consider far from good enough.

The lack of proper automated testing is particularly irksome to me, since it means that making changes have to be manually validated, and that will never be consistent and thorough enough.

That being said, currently it does work and meet all the requirements of the spec.

# Running locally
## DB
The DB is hosted, and the URL is set in the `.env`. A few test users are already seeded.

| username | password |
| -------- | -------- |
| peter    | 1234     |
| benjamin | 1234     |
| jess     | 1234     |
| tom      | 1234     |
## Running the app locally
Run the commands below
```
npm install
npm run dev
```

I included the `.env`, so there's no manual config necessary.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
# Seeding
You shouldn't need to do any seeding, since I've left the DB users in place.

There are seeding script files in the project root to seed and delete data from the DB.

- seedUsers.ts
- seedMessages.ts
- deleteSeededUsers.ts
- deleteSeededMessages.ts

You can run these script using the command below, please read the info in the comment at the top of the script file before running.

```
npx tsx {{scriptFileName.ts}}
```

# Stack
- NextJS
- PostgreSQL
- Prisma ORM
- Socket.io
- React
- ChakraUI
# Core Overview
## Database
I'm using PostgreSQL for the database, managed via Prisma ORM.

The data tables are Users and Messages, you can see their structure in `schema.prisma`.
The frontend additionally see Threads, but these do not exist as their own table, they are inferred if any Messages exist between two Users.

## Websockets
Data in sent to the frontend via the Socket.io library, which is an abstraction of Websockets.

Server side sockets are managed in `server.ts`
Client side is managed in `AuthedView.tsx` (Would like to extract this to a dedicated file)

### Data loading
After the client logins in, a websocket connection is opened, and the client emits the "requestData" event. The server add the client to a room, and returns all data for the client in the shape below, and stored in state.

```ts 
type DataToClient = {
	username: string;
    threads: Thread[];
    // currentChat is only populated if the "requestData" event included a selectedChatUserId
    currentChat: Message[]; 
}
```

The "requestData" event is called again whenever a user opens a chat thread, and will not return the messages in that thread.

The client will also emit the "requestData" event whenever it receives a "newDataReady" event.

### Sending a new message
The client emits the "sendMessage" event with the message recipient id and content of the message.

The server creates the new Message in the DB.

The server emits the "newDataReady" to the user sending the message and the room that the recipient is in.

### Auth
Auth is managed via JWTs, created with the `passport` library.

Only users with a valid JWT can connect to the Websocket.

On login, the user's password is compared to a password has stored in the DB, and if it matches a new JWT is stored in a cookie.

This JWT is passed in the auth header on Websocket connection.

### UI
I've used the ChakraUI library, and not done any custom styling, since looks were not a high requirement.

Most of the UI was generated via Claude with some manual modifications.

# Testing
The functions that interact with the DB are tested with Jest. I would consider this is be far too little testing, I really wanted to include a full test suite, but could not due to the time constraints.

This is the first area I would address given more time.

# Known Issues
- Not enough tests means working on this takes a lot of manual testing, and makes proper verification of functionality difficult.
- Token expiry isn't covered properly
- Auth input validation and error handling could be significantly refactored
- Websocket implementation is not efficient sending all data on every reload
- Logout functionality is not complete, doesn't invalidate token server side
- Loading states aren't complete
- Messages aren't paginated in queries
- Database query errors are not covered
- Client Socket init could create multiple sockets

# Future Improvements
- Implement Socket.io Postgres Adaptor (No time to research)
- Message marking as read is not ideally timed
- Data sending is inefficient on reload, since it sends the whole set of username, threads and currently loading chat messages
- State storage is messy, would like to make a proper global state store
- Optimistic UI updates would be nice to make it look like messages send instantly

# Troubleshooting
If you get stuck on a loading screen when returning to the app after logging in, try clearing cookies for localhost:3000.
Probably your JWT is no longer valid, and the app is not handling that case properly.
