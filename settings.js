module.exports = {
    apiURL: "http://localhost:3032",
    socketURL: "ws://localhost:3032",
    avatarURL: (userid, avatar) => `https://cdn.discordapp.com/avatars/${userid}/${avatar}.webp?size=512`
}
