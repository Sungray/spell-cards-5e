# Use the latest Node.js as the base image
FROM node:latest

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Clone the 5etools repository (or you can just download the required files)
RUN git clone https://github.com/5etools-mirror-1/5etools-mirror-1.github.io.git /tmp/5etools
RUN mkdir -p /usr/src/app/spells && cp -r /tmp/5etools/data/spells /usr/src/app/spells

# Install the app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN npm install

# Bundle the app source inside the Docker image
COPY . .

# Build the application
RUN npm run build

# Expose port 3000 for the application
EXPOSE 3000

# Define a volume for custom spells
# This allows users to mount their custom spells directory at runtime
VOLUME ["/usr/src/app/custom-spells"]

# Start the app
CMD ["npm", "start"]
