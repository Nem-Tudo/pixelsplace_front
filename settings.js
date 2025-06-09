module.exports = {
    apiURL: "http://pixelsplace.nemtudo.me/api",
    socketURL: "ws://pixelsplace.nemtudo.me/api",
    avatarURL: (userid, avatar) => `https://cdn.discordapp.com/avatars/${userid}/${avatar}.webp?size=512`
}
