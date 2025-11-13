import Head from "next/head";

/**
 * Head tematizado do site
 * @param {Object} properties - Passagem de propriedades pro head
 * @param {string} [properties.title] - Título da página (opcional)
 * @param {string} [properties.description] - Descrição da página (opcional)
 * @param {string} [properties.url] - Link da página (opcional)
 * @param {string} [properties.imageUrl] - Link da imagem da página (opcional)
 */
export default function CustomHead({
    title = "HACKEDPlace",
    description = "Se junte ao PixelsPlace!",
    url = 'https://pixelsplace.nemtudo.me',
    imageUrl = "/logo.png"
}) {

    return <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#80bbff" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={url} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description}  />
        <meta property="twitter:image" content={imageUrl} />
      </Head>

}
