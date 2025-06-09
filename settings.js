module.exports = {
    apiURL: "https://pixelsplace.nemtudo.me/api",
    socketURL: "wss://pixelsplace.nemtudo.me/api/socket",
    avatarURL: (userid, avatar) => `https://cdn.discordapp.com/avatars/${userid}/${avatar}.webp?size=512`
}
