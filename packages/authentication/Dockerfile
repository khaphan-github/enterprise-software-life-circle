# Use the official Node.js image as base
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN pnpm build

# --- Production Stage ---
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm in production container
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only necessary files for production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy built application from the builder stage
COPY --from=builder /app/dist ./dist

# Copy necessary config files
COPY --from=builder /app/node_modules ./node_modules

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
