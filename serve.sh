#!/usr/bin/env sh

docker run --rm --volume="$PWD/docs:/srv/jekyll" --volume="$PWD/docs/vendor/bundle:/usr/local/bundle" --env JEKYLL_ENV=development -p 4000:4000 jekyll/jekyll:3.8 jekyll serve
