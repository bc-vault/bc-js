FROM nginx
ADD proxy_example.html /usr/share/nginx/html/index.html
ADD build/bc_js_ie.js /usr/share/nginx/html/build/