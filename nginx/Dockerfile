FROM nginx:1.28

RUN mkdir /etc/nginx/ssl
COPY ssl/ssl.key /etc/nginx/ssl/
COPY ssl/ssl.crt /etc/nginx/ssl/
COPY nginx.conf /etc/nginx/nginx.conf


