# Use official lightweight Node image as the base for dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies with npm ci for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the rest of the project and build the application
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --omit=dev

# Final image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
