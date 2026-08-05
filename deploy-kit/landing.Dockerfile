# ─── LovMy Landing (HTML/CSS/JS statique) ────────────────────────────────────
FROM nginx:alpine
COPY nginx-landing.conf /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
