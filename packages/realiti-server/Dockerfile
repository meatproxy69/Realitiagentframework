# REALITI dedicated server: the canonical client plus the shared ledger hub. No npm dependencies.
FROM node:22-alpine
WORKDIR /app
COPY RealitiRELAX.html VALIDATION.json AGENT_START_HERE.md README.md CHANGELOG.md ./
COPY packages/realiti-server/package.json packages/realiti-server/server.cjs ./packages/realiti-server/
ENV PORT=8787 REALITI_DATA=/data REALITI_CLIENT_DIR=/app NODE_ENV=production
VOLUME ["/data"]
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:8787/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node","packages/realiti-server/server.cjs"]
