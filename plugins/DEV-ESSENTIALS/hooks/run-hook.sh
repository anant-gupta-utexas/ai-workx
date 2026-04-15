#!/bin/sh
# Resolves node path for environments where /bin/sh lacks PATH to node (nvm, fnm, volta, etc.)

find_node() {
  command -v node 2>/dev/null && return

  for dir in \
    "$HOME/.nvm/versions/node"/*/bin \
    "$HOME/.fnm/node-versions"/*/installation/bin \
    "$HOME/.volta/bin" \
    /opt/homebrew/bin \
    /usr/local/bin; do
    if [ -x "$dir/node" ]; then
      echo "$dir/node"
      return
    fi
  done

  echo "node" # fallback; will fail with a clear error
}

NODE=$(find_node)
exec "$NODE" "$@"
