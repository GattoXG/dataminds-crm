# 🐳 Deploy com Docker - NossoCRM

Este guia explica como fazer deploy do NossoCRM em sua própria VPS usando Docker.

---

## Pré-requisitos

- VPS com Linux (Ubuntu 20.04+ recomendado)
- Docker e Docker Compose instalados
- Git instalado
- Projeto Supabase configurado ([veja Passo 2 do guia Vercel](./DEPLOY.md#passo-2-criar-projeto-no-supabase-2-minutos))

---

## Instalação Rápida (5 minutos)

### 1. Clone o repositório na VPS

```bash
git clone https://github.com/seu-usuario/dataminds-crm.git
cd dataminds-crm
```

### 2. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite com suas credenciais
nano .env
```

Preencha as variáveis:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
VITE_GEMINI_API_KEY=sua-gemini-api-key-aqui
```

### 3. Build e inicie o container

```bash
# Build da imagem (primeira vez ou após mudanças)
docker-compose build

# Inicie em background
docker-compose up -d
```

### 4. Verifique se está rodando

```bash
# Ver logs
docker-compose logs -f

# Ver status
docker-compose ps

# Health check
curl http://localhost:3000/health
```

A aplicação estará disponível em `http://seu-ip:3000`

---

## Comandos Úteis

```bash
# Parar containers
docker-compose down

# Reiniciar
docker-compose restart

# Rebuild após mudanças no código
docker-compose build --no-cache
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f nossocrm

# Entrar no container
docker exec -it nossocrm-app sh
```

---

## Deploy com HTTPS (SSL) via Nginx Reverse Proxy

Para produção, recomendamos usar Nginx como reverse proxy com SSL via Let's Encrypt.

### 1. Atualize o docker-compose.yml

Crie um arquivo `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  nossocrm:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
        - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
        - VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}
    container_name: nossocrm-app
    restart: unless-stopped
    expose:
      - "80"
    networks:
      - nossocrm-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  nginx-proxy:
    image: nginx:alpine
    container_name: nossocrm-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - nossocrm
    networks:
      - nossocrm-network

  certbot:
    image: certbot/certbot
    container_name: nossocrm-certbot
    volumes:
      - ./ssl:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

networks:
  nossocrm-network:
    driver: bridge
```

### 2. Crie a configuração do Nginx Proxy

Crie o arquivo `nginx-proxy.conf`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com.br;

    ssl_certificate /etc/nginx/ssl/live/seu-dominio.com.br/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/live/seu-dominio.com.br/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://nossocrm:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Gere o certificado SSL

```bash
# Primeira vez - gerar certificado
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d seu-dominio.com.br \
  --email seu-email@gmail.com \
  --agree-tos \
  --no-eff-email

# Inicie o stack completo
docker-compose -f docker-compose.prod.yml up -d
```

---

## Deploy Automático com GitHub Actions

Crie `.github/workflows/deploy-docker.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/dataminds-crm
            git pull origin main
            docker-compose build --no-cache
            docker-compose up -d
            docker system prune -f
```

Configure os secrets no GitHub:
- `VPS_HOST`: IP ou domínio da sua VPS
- `VPS_USER`: Usuário SSH (ex: `ubuntu`)
- `VPS_SSH_KEY`: Chave privada SSH

---

## Monitoramento

### Logs

```bash
# Ver últimas 100 linhas
docker-compose logs --tail=100 nossocrm

# Seguir logs em tempo real
docker-compose logs -f nossocrm
```

### Métricas básicas

```bash
# Uso de recursos do container
docker stats nossocrm-app

# Verificar saúde
docker inspect --format='{{.State.Health.Status}}' nossocrm-app
```

---

## Backup e Restore

O NossoCRM usa Supabase para persistência, então os dados estão no banco de dados remoto. Para backup:

1. Use o painel do Supabase para exportar dados
2. Ou configure `pg_dump` para backups automáticos

---

## Troubleshooting

### Container não inicia

```bash
# Ver logs de erro
docker-compose logs nossocrm

# Verificar build
docker-compose build --no-cache
```

### Erro de permissão

```bash
# Se necessário, ajuste permissões
sudo chown -R $USER:$USER .
```

### Porta em uso

```bash
# Verificar o que está usando a porta 3000
sudo lsof -i :3000

# Ou mude a porta no docker-compose.yml
ports:
  - "8080:80"  # Usar porta 8080
```

### Limpar recursos Docker

```bash
# Remover containers parados, imagens não usadas, etc
docker system prune -a

# Remover volumes não usados (CUIDADO!)
docker volume prune
```

---

## Requisitos de VPS

**Mínimo:**
- 1 vCPU
- 1 GB RAM
- 10 GB disco

**Recomendado para produção:**
- 2 vCPU
- 2 GB RAM
- 20 GB disco SSD

---

## Suporte

Dúvidas? Abra uma issue no GitHub.
