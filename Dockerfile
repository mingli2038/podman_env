FROM node:latest

RUN apt-get update && \
   # apt install --only-upgrade linux-libc-dev && \
    apt-get install -y \
    npm curl libseccomp-dev sudo

COPY files/*.js /home/user/
COPY files/*.json /home/user/

RUN addgroup --gid 10008 choreo &&\
    adduser --disabled-password  --no-create-home --uid 10008 --ingroup choreo user &&\
    usermod -aG sudo user &&\
    echo "user:root" | sudo chpasswd &&\
    chown user:choreo /home/user

RUN  cd /home/user/ && \
     npm install 

USER 10008

WORKDIR /home/user/

CMD ["bash", "-c", "node index.js > /tmp/run.log 2>&1"]

EXPOSE 9000
