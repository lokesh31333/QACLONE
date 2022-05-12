#### Env variable:

Create a .env file in server directory and add the following:




```
MONGODB_URI = "mongodb+srv://273lab1:lokesh812@cluster0.k6wzw.mongodb.net/273project?retryWrites=true&w=majority"
PORT = 4000
SECRET = "Your JWT secret"

REDIS_DATABASE_URL=redis://tester:Tester_1234@redis-15923.c16.us-east-1-2.ec2.cloud.redislabs.com:15923

SECRET_KEY=cbKgCDMikg
DATABASE_USERNAME=admin 
DATABASE_PASSWORD=stackoverflow123#
DATABASE_NAME=stackoverflow
DATABASE_HOST=stackoverflowdb.cr2jfobyiuyg.us-east-1.rds.amazonaws.com


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
