# syntax=docker/dockerfile:1
FROM alpine:3.22
LABEL org.opencontainers.image.source="https://github.com/ddotsmedia/introyale"
RUN apk add --no-cache postgresql16-client restic tzdata busybox \
 && adduser -D -u 10002 backup
ENV TZ=Asia/Dubai
COPY docker/backup/backup.sh /usr/local/bin/backup.sh
COPY docker/backup/scheduler.sh /usr/local/bin/scheduler.sh
RUN chmod 0755 /usr/local/bin/backup.sh /usr/local/bin/scheduler.sh
USER 10002
CMD ["/usr/local/bin/scheduler.sh"]
