#!/usr/bin/env sh

docker run --rm -it --volume="$PWD/docs:/srv/jekyll" --volume="$PWD/vendor/bundle:/usr/local/bundle" --env JEKYLL_ENV=production jekyll/jekyll:3.8 jekyll build
