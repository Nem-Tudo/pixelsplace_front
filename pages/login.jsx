import settings from "@/settings.js"

export function getServerSideProps({ req, query }) {
    return {
        redirect: {
            permanent: false,
            destination: `${settings.apiURL}/auth/discord?${query?.redirectURL ? `redirectURL=${query.redirectURL}` : ""}`
        }
    }
}

export default function Login() {
    return <>
        <h1>Redirecionando...</h1>
    </>
}