# siwe-nestjs
Simple web app to show the integration between NestJS and SIWE.

Currently, the jwt secret is stored in a file in the backend, and the generated signed tokens are stored in a cookie (so the security level is not great).

To test the application:
- Run the backend:
  
    ```bash
    cd backend
    npm i
    npm run start:dev
    ```
- Run the frontend:
  
    ```bash
    cd frontend
    cp .env.example .env # and set the alchemy api key
    source .env
    npm i
    npm run start
    ```