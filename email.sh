#!/bin/bash

random() {
    local array=("$@")
    local array_length=${#array[@]}
    local random_index=$((RANDOM % array_length))
    local random_element=${array[random_index]}
    
    echo "$random_element"
}

file_path="list.txt"
connection="endpoint=https://supra-communication-service.communication.azure.com/;accesskey=xsMYXmxYGzTkm4A+HkcDD5ObsVpcSaT6T6yTWQ0S8ie521fnEt8bjPf84Mwp47181oheLmGCsC5C4/wSPzWgIA=="
senders=(
    "DoNotReply@e9015c87-f215-4f49-a522-8af9ec65453e.azurecomm.net"
)
subjects=(
    "Action Required: Unauthorized Access Attempt Detected"
)

html=$(cat email.html)
text=$(cat email.txt)

if [ -f "$file_path" ]; then
    while IFS= read -r email; do
        
        sender="$(random "${senders[@]}")"
        subject="$(random "${subjects[@]}")"

        az communication email send \
            --connection-string "$connection" \
            --sender "$sender" \
            --subject "$subject" \
            --text "$html" \
            --html "$text" \
            --to "$email"

        echo "$email sent"
    done < "$file_path"
else
    echo "File not found: $file_path"
fi
