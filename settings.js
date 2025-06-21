// module.exports = {
//     apiURL: "http://localhost:3032",
//     socketURL: "ws://localhost:3032",
//     avatarURL: (userid, avatar) => `https://cdn.discordapp.com/avatars/${userid}/${avatar}.webp?size=512`
// }

module.exports = {
    apiURL: "https://apipixelsplace.nemtudo.me",
    socketURL: "wss://apipixelsplace.nemtudo.me",
    avatarURL: (userid, avatar) => `https://cdn.discordapp.com/avatars/${userid}/${avatar}.webp?size=512`
}
