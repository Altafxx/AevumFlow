#!/bin/bash

# Wait for the video file to be available
while [ ! -f /mnt/uploads/video.mp4 ]; do
    sleep 1
done

# Move the uploaded video to the VOD directory
mv /mnt/uploads/video.mp4 /mnt/vod/

# Generate JSON file based on the uploaded video
echo '{"video_path": "/mnt/vod/video.mp4", "timestamp": "'$(date -u)'" }' > /mnt/json/video_info.json
