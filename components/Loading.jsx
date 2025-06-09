export default function Loading({width}){
    return <>
        <div>
            <img width={width} style={{filter: "invert(1)"}} src="/assets/loading.svg" color="white"/>
        </div>

    </>
}