FROM nginx:alpine
COPY selfsigned.crt /etc/ssl/certs/
COPY priv.key /etc/ssl/private/
COPY default.conf /etc/nginx/conf.d/
EXPOSE 443
