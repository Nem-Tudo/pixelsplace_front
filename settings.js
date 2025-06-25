module.exports = {
    apiURL: "https://apipixelsplace.nemtudo.me",
    socketURL: "wss://apipixelsplace.nemtudo.me",
    avatarURL: (userid, avatar) => `https://cdn.discordapp.com/avatars/${userid}/${avatar}.webp?size=512`,
    branchURL: (activeBranch, pathname = "", search = "") => `https://pixelsplace-front-git-${activeBranch}-nemtudos-projects.vercel.app${pathname}${search}`
}