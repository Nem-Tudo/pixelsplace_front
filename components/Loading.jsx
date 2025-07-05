/**
 * Animação de carregamento
 * @param {string} [width=50px] - Tamanho do elemento [Padrão: "50px"] 
 */
export default function Loading({ width = "50px" }){
    return <>
        <div>
            <img width={width} style={{filter: "invert(1)"}} src="/assets/loading.svg" color="white"/>
        </div>

    </>
}