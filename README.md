# Zero's Place
## MiraiPlace
__ __

### Features and Plans

| Feature | Status | Note |
| ------ | ------ |  ------ |
| Login | ✔️ | Implemented with Discord Login |
| Sessions | ➖ | Cookies werden genutzt |
| VIP / Mod | ✔️ |  CTRL + SHIFT + F to open Key Menu |
| Multiple Colors | ✔️ |  Free Coloring and Set coloring. |
| Discord Config | ✔️ |  moved into server.json |
| Toggle Login | ❌ | Currently there's no Option to turn off Discord Auth |
| Scroll Lag |❓| in recent tests, it's gone, we'll see if it is fixed. |



__ __
### Installation

1. `git clone git@github.com:oOHiyoriOo/MiraiPlace.git`
2. Change in `./settings`:
    - `place.json`
    - `server.json`

3. `npm i` in the main dir.
4. `node server.js`
5. Profit

__ __
### Nginx?
> Currently i have no pre-made ngin config as I am stil working on more Moderation tools.´


__ __
### Config:

#### place.json
```json
{
    "colors": [ // configure the colors you allow the user to use (ignore if you want to use free colors.)
        "#9D37A8",
        "#47C1E5",
        "#F28425",
        "#72CF53",
        "#F2C94C",
        "#D1314F",
        "#4F6D7A",
        "#000000",
        "#FF0000",
        "#00FF00",
        "#0000FF",
        "#FFFF00",
        "#FF00FF",
        "#00FFFF",
        "#FFFFFF"
    ],
    "cooldown": 5000, // cooldown in MS
    "width": 1920, // px height and width of the canvas
    "height": 1080
}
```

#### server.json
```json
{
    "host": "127.0.0.1", // the host to listen on, most of the time you want '0.0.0.0'
    "port": 8080, // the port is should listen on.
    "database": ":memory:", // the database to use, this can be :memory: to be RAM only or a filename like 'canvas.sql'
    "jwt_secret":"SuperSecretToken4242", // the secret used to encrypt the JWT token
    "free_colors":true, // this enables or disabled the color picker.
    "jwt_expiry": 86400, // how long should the JWT token eist? in generel discord tokens are valid for 7 days, you should keep this lower.
    "discoprd_auth_url": "https://discord.com/api/oauth2/authorize?client_id=xxxxx&redirect_uri=http://xxxx/auth&response_type=token&scope=identify" // discord auth url.

}
```
> You can get the AUTH URL here: [Discord Dev Portal](https://discord.com/developers/applications)


__ __
### Commands:
`ban('DISCORDID')` ban a user by his Discord ID (can be found in the Terminal after the Name)
`unban('DISCORDID')` unban user by it's ID
`getkey()` generates a VIP / Mod Key, can be used by pressing CTRL + SHIFT + F on the canvas.
`shutdown()` can be used to stop the server (for some reason doesn't work every time, `^C` is a better Solution )