#!/bin/bash
set -e

# run roseer server
npm start

exec "$@"
