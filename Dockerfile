# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências primeiro (melhor cache)
COPY package.json package-lock.json* ./
RUN npm ci

# Copia código fonte
COPY . .

# Build arguments para variáveis de ambiente do Vite
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_GEMINI_API_KEY

# Seta as variáveis de ambiente para o build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Build da aplicação
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS production

# Copia configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe porta 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
