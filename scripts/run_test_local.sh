#!/bin/bash

cd ..

URLS=( "https://www.codeiris.com/acaudwell/Gource/view/latest?indicator=CHANGES&angle=0.8&switch=screenshot" "https://www.codeiris.com/docker/docker/view/latest?color=IMPACT&author=github@gone.nl&angle=1&indicator=BYTES&switch=screenshot" "https://www.codeiris.com/dogecoin/dogecoin/view/latest?color=IMPACT&author=laanwj@gmail.com&switch=screenshot" )

for i in "${!URLS[@]}"; do
  printf '${URLS[%s]}=%s\n' "$i" "${URLS[i]}"
  echo 'invoking '${URLS[i]}
  serverless invoke local --function png --log --data '{ "queryStringParameters": {"waiting" : 1000, "waitForSelector" : "body.renderingdone", "url":"'${URLS[i]}'"}}' > out_${i}.txt

  cat out_${i}.txt | grep 'body'  | awk '{print "{" $0 " \"avl\" : true" "}"  }' | jq -r .body | base64 --d -o img_${i}.png

done

