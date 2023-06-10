FROM node:16.14.0

WORKDIR /opt/roseer
COPY ./package.json /opt/roseer/package.json
COPY ./package-lock.json /opt/roseer/package-lock.json
COPY ./public /opt/roseer/public
COPY ./src /opt/roseer/src
COPY ./roseer_entrypoint.sh /opt/roseer/roseer_entrypoint.sh
RUN npm install
ENTRYPOINT [ "/bin/bash", "/opt/roseer/roseer_entrypoint.sh" ]
