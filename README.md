#### Env variable:

Create a .env file in server directory and add the following:

cd into the database folder and do the following commands to run database.
docker build -t my-mysql .
docker run -d -p 3307:3306 --name my-mysql -e MYSQL_ROOT_PASSWORD=supersecret my-mysql



```
MONGODB_URI = "mongodb+srv://stackuser:stackpass@273.nt9il.mongodb.net/stackoverflow?retryWrites=true&w=majority"
PORT = 4000
SECRET = "Your JWT secret"

REDIS_DATABASE_URL=redis://tester:Tester_1234@redis-15923.c16.us-east-1-2.ec2.cloud.redislabs.com:15923

SECRET_KEY=cbKgCDMikg
DATABASE_USERNAME=root
DATABASE_PASSWORD=supersecret
DATABASE_NAME=myusers
DATABASE_HOST=localhost


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
