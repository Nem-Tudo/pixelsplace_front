import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import styles from "@/components/popups/DisplayPopup.module.css";
import PixelIcon from "@/components/PixelIcon";
import centsToPrice from "@/src/centsToPrice";

import { FaCreditCard } from "react-icons/fa"
import { FaPix } from "react-icons/fa6";
import { usePopup } from "@/context/PopupContext";
import settings from "@/settings";
import { useAuth } from "@/context/AuthContext";
import { copyText } from "@/src/copyText";
import Link from "next/link";


export default function BuyPixel({ closePopup, pixelPrice }) {

    const { openPopup } = usePopup()
    const { token } = useAuth();

    const [quantity, setQuantity] = useState(21);
    const [selectedMethod, setSelectedMethod] = useState("PIX");
    const [loading, setLoading] = useState(false);

    async function buy() {
        setLoading(true);
        const request = await fetch(`${settings.apiURL}/buy/pixel`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({
                quantity: quantity
            })
        })
        const response = await request.json();
        setLoading(false);
        if (request.status != 200) return openPopup("error", { message: response?.message })

        if (response.method === "PIX") {
            openPopup("generic", {
                icon: <FaPix />,
                title: "Aguardando pagamento via PIX",
                message: <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <img style={{ maxWidth: "500px", margin: "10px auto" }} src={response.payment.qrcode_image} />
                    <button className={styles.copyButton} onClick={(e) => {
                        copyText(response.payment.copy_and_paste)

                        e.target.innerText = "Copiado!";
                        setTimeout(() => {
                            e.target.innerText = "Copiar PIX"
                        }, 3000)
                    }}>Copiar PIX</button>
                </div>
            })
        }

        if (response.method === "CARD") {
            openPopup("generic", {
                icon: <FaCreditCard />,
                title: "Aguardando pagamento via Cartão",
                message: <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <Link className={styles.copyButton} href={response.payment.payment_url} target="_blank" ref={"noreferrer"}>Ir para pagamento</Link>
                </div>
            })
        }
    }

    return (<>
        <h1 className={styles.title}>
            <PixelIcon codename={'alert'} />
            Compra de pixels
        </h1>

        <main className={styles.scrollable}>
            <span>Escolha a quantidade de pixels (R${centsToPrice(pixelPrice)} cada)</span>
            <input style={{ height: "30px" }} type="number" value={quantity} min={10} onChange={(e) => setQuantity(e.target.value)} />
            <span style={{ color: "#00ac00ff" }}>Valor total: R${centsToPrice(quantity * pixelPrice)}</span>
            <div>
                <h3 style={{ fontWeight: "800" }}>Método de pagamento:</h3>
                <div style={{ display: "flex", gap: "3px", flexDirection: "column", marginTop: "7px" }}>
                    <div>
                        <input
                            type="radio"
                            name="method"
                            id="method_pix"
                            value="PIX"
                            checked={selectedMethod === 'PIX'}
                            onChange={(e) => setSelectedMethod(e.target.value)}
                        />
                        <label htmlFor="method_pix"><FaPix color="29BBAC" /> PIX <span className={styles.tip}>(recomendado!)</span></label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            name="method"
                            id="method_card"
                            value="CARD"
                            checked={selectedMethod === 'CARD'}
                            onChange={(e) => setSelectedMethod(e.target.value)}
                        />
                        <label htmlFor="method_card"><FaCreditCard /> Cartão</label>
                    </div>
                </div>
            </div>
        </main>

        <footer className={styles.footer} style={{ gap: "12px" }}>
            <CustomButton disabled={loading} hierarchy={3} label={"Cancelar"} onClick={() => closePopup()} />
            <CustomButton disabled={loading} color="#00ac00ff" label={"Confirmar"} onClick={() => buy()} />
        </footer>
    </>
    );
}