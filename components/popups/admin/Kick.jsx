import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import styles from "@/components/popups/DisplayPopup.module.css";
import PixelIcon from "@/components/PixelIcon";
import { usePopup } from '@/context/PopupContext';

/**
 * Pop-up administrativo de confirmação de desconexão de usuário
 * @param {Object} properties - Passagem de propriedades pro pop-up
 * @param {() => {}} properties.closePopup - Função de fechamento do pop-up
 * @param {JSON} properties.user - Usuário que será desconectado se confirmado
 */
export default function AdminKick({ closePopup, user }) {
  const { openPopup } = usePopup();
  const [reason, setReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      openPopup("error", { message: "Motivo é obrigatório." });
      return;
    }

    try {
      const res = await fetchWithAuth(`/admin/onlineusers/${user?.id}/disconnect`, "POST", {
        reason,
      });

      if (res) {
        openPopup("success", { message: "Usuário desconectado com sucesso." });
        closePopup();
      } else {
        openPopup("error", { message: "Erro ao desconectar o usuário." });
      }
    } catch (error) {
      console.error(error);
      openPopup("error", { message: "Erro inesperado. Tente novamente." });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className={styles.title}>
        <PixelIcon codename="user-x" />
        {'Desconectar usuário'}
      </h1>

      <main className={styles.scrollable}>
        <textarea
          id="adminKick_reason"
          name="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          placeholder="Escreva o motivo do kick..."
          rows={4}
          autoFocus
        />
      </main>

      <footer className={styles.footer}>
        <CustomButton
          label="Cancelar"
          hierarchy={3}
          color="#636363"
          onClick={() => closePopup()}
        />
        <CustomButton
          label="Desconectar"
          icon='user-x'
          type="submit"
        />
      </footer>
    </form>
  );
}
