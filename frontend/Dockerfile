FROM node:20-alpine
WORKDIR /app
EXPOSE 3000
# Source and the sibling schema-builder dependency arrive via docker-compose bind
# mounts at container start (not present during `docker build`), so install there
# instead of baking node_modules into the image.
CMD ["sh", "-c", "npm install && npm run dev"]
