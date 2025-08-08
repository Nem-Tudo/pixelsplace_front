// module.exports = {
// 	apiURL: "http://localhost:3032",
// 	socketURL: "ws:///localhost:3032",
// 	avatarURL: (userid, avatar) => `https://cdn.discordapp.com/avatars/${userid}/${avatar}.webp?size=512`,
// 	guildIconURL: (guildId, icon) => `https://cdn.discordapp.com/icons/${guildId}/${icon}.webp?size=512`,
// 	branchURL: (activeBranch, pathname = "", search = "") => `https://pixelsplace-front-git-${activeBranch}-nemtudos-projects.vercel.app${pathname}${search}`,
// 	availableLanguages: ["ar", "en", "es", "fr", "hi", "ja", "ka", "pt-BR", "pt-PT", "ru", "zh"],
// 	defaultLanguage: "pt-BR"
// }


module.exports = {
    apiURL: "/proxyapi",
    socketProtocol: "wss",
    socketURL: "/proxyapi",
    avatarURL: (userid, avatar) => `https://cdn.discordapp.com/avatars/${userid}/${avatar}.webp?size=512`,
    guildIconURL: (guildId, icon) => `https://cdn.discordapp.com/icons/${guildId}/${icon}.webp?size=512`,
    branchURL: (activeBranch, pathname = "", search = "") => `https://pixelsplace-front-git-${activeBranch}-nemtudos-projects.vercel.app${pathname}${search}`,
    availableLanguages: ["ar", "en", "es", "fr", "hi", "ja", "ka", "pt-BR", "pt-PT", "ru", "zh"],
    defaultLanguage: "pt-BR"
}
