FROM oraclelinux:7-slim

RUN yum -y install oracle-release-el7 oracle-nodejs-release-el7 && \
    yum-config-manager --disable ol7_developer_EPEL && \
    yum -y install oracle-instantclient19.3-basiclite nodejs && \
    rm -rf /var/cache/yum && \
    mkdir cert

COPY build-resource/wallet/* /usr/lib/oracle/19.3/client64/lib/network/admin/

WORKDIR /app
ADD . /app/
RUN npm install
EXPOSE 3000
ENTRYPOINT ["npm", "start"]