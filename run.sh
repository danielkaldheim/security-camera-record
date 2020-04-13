#!/bin/sh

now=`date '+%Y-%m-%d:%H:%M:%S'`
ffmpeg -f mjpeg -nostats -loglevel 0 -re -t 3600 -i http://10.1.4.91:8080/?action=stream -an -r 10 -vcodec libx264 -pix_fmt yuv420p /record/data/cam_$now.mp4
find /record/data/ -type f -mtime +5 -exec rm {} \;
