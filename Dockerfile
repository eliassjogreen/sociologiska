FROM node:lts AS base
WORKDIR /app

# By copying only the package.json and package-lock.json here, we ensure that the following `-deps` steps are independent of the source code.
# Therefore, the `-deps` steps will be skipped if only the source code changes.
COPY ./package.json ./package-lock.json ./

FROM base AS prod-deps
RUN npm install --omit=dev

FROM base AS build-deps
RUN npm install

FROM build-deps AS build
COPY . .
RUN npm run build

FROM base AS script
COPY --from=prod-deps /app/node_modules ./node_modules
COPY ./src/ ./src

FROM script AS export
ENV INTERVAL=3600
CMD ["sh", "-c", "while true; do node ./src/scripts/export.ts; sleep \"$INTERVAL\"; done"]

FROM script AS migrate
ENV APPLY_MIGRATIONS=true
CMD ["node", "./src/scripts/migrate.ts"]

FROM base AS server
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY ./src/server/migrations ./src/server/migrations

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
