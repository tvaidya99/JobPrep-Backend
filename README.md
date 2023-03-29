# JobPrep

JobPrep is an innovative online platform designed to assist job seekers in preparing for their desired positions. This web application offers a range of tools to evaluate and score resumes and cover letters, providing job seekers with valuable feedback and resources to create an ideal profile. Additionally, JobPrep offers an interview preparation tool specifically designed to prepare job seekers for behavioral interviews by providing randomized behavioral questions that can be answered and recorded. Furthermore, JobPrep offers resources to assist job seekers in preparing for technical interviews.

# JobPrep Backend

This repository is the backend of the JobPrep web application. It is based on NodeJS that utilizes both Express and Web Socket to serve the users.

## Requirements:

1. Install `npm and Node` using `nvm`: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm

## How to configure locally

1. Open terminal, and go to the project directory.
2. Run command: `npm install` to install all the required dependencies
3. Once installed, run `node socket-server.js`. This will host the backend locally at http://localhost:8080
   1. This server uses web socket to proactively deliver results to the frontend once available.
4. Run `node api-server.js`. This will host another server that will take care of api Requests at http://localhost:8090
   1. This server uses Express server to deliver regularly updated resources on every request.

## How to deploy

1. Clone this repository to any server irrespective of platform OS, and follow the same steps as above.
2. One can also use different domains/subdomains for socket and api servers.