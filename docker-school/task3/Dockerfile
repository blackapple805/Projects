FROM nginx
COPY --chown=nginx:nginx html /usr/share/nginx/html
COPY --chown=nginx:nginx cond.f/default.conf /etc/nginx/conf.d
COPY --chown=nginx:nginx certs /etc/nginx/certs
