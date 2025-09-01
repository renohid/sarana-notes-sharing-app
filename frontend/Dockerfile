# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# PAKAI npm install (bukan ci) supaya tidak error saat lock mismatch
RUN npm install --no-audit --no-fund

# ---------- build ----------
FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

# ---------- runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# pakai node_modules hasil install dari stage deps
COPY --from=deps /app/node_modules ./node_modules

# copy hasil build + aset
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["npm","start"]
