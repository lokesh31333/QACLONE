#### Env variable:

Create a .env file in server directory and add the following:

```
MONGODB_URI = "mongodb+srv://stackuser:stackpass@273.nt9il.mongodb.net/stackoverflow?retryWrites=true&w=majority"
PORT = 4000
SECRET = "Your JWT secret"

```

#### Client:

Open client/src/backendUrl.js & change "backend" variable to `"http://localhost:4000"`

```
cd client
npm install
npm start
```

#### Server:

Note: Make sure that you have installed 'nodemon' as global package.

```
cd server
npm install
npm run dev
```
