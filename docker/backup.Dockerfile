# syntax=docker/dockerfile:1
FROM alpine:3.22
RUN apk add --no-cache postgresql16-client restic tzdata busybox \
 && adduser -D -u 10002 backup
ENV TZ=Asia/Dubai
COPY docker/backup/backup.sh /usr/local/bin/backup.sh
COPY docker/backup/crontab /etc/crontabs/backup
RUN chmod 0755 /usr/local/bin/backup.sh
USER 10002
CMD ["crond", "-f", "-l", "8", "-c", "/etc/crontabs"]
