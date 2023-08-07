# Boty Copper-Kettle

This is my WhatsApp bot built with [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js). Status responses are mostly just some from [VyxalBot](https://github.com/Vyxal/VyxalBot2).

## Setup

In theory you should only need to do:

```bash
git clone https://github.com/tobyck/boty-ck.git
cd boty-ck
yarn install
yarn start
```

but there were a few things which went wrong while trying to set it up on an Oracle Cloud VM. These are some notes to self in case I have to set it up again:

- `dnf install nodejs` installed an older version of Node.js, so it needs updating for Puppeteer:

    ```bash
    npm install n -g
    n stable
    ```

- Puppeteer required some extra dependencies for Chrome which can be added with:

    ```bash
    curl -O https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
    sudo yum -y localinstall google-chrome-stable_current_x86_64.rpm
    ```

- To keep the bot after disconnecting from the VM:

    ```bash
    yarn start &  # Start job in background
                  # To return to the shell, press Enter once the client is ready
    disown        # Prevent SIGHUP
                  # You can now close the session
    ```

- To kill the bot manually you need to find the process ID:

    ```bash
    ps aux | grep boty-ck.js
    kill <PID>
    ```