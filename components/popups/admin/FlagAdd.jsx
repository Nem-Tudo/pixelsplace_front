import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import styles from "@/components/popups/DisplayPopup.module.css";
import PixelIcon from "@/components/PixelIcon";
import { useLanguage } from '@/context/LanguageContext';
import { usePopup } from '@/context/PopupContext';

/**
 * Pop-up administrativo de adição de nova flag a usuário
 * @param {Object} properties - Passagem de propriedades pro pop-up
 * @param {() => {}} properties.closePopup - Função de fechamento do pop-up
 * @param {JSON} properties.user - Usuário que será desconectado se confirmado
 * @param {() => {}} properties.setUser - Função de setar usuário
 * @param {() => {}} properties.updateStateKey - Função de atualização de estado de chave
 */
export default function AdminFlagAdd({ closePopup, user, setUser, updateStateKey }) {
  const { language } = useLanguage();
  const { openPopup } = usePopup();
  const [flag, setFlag] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!flag.trim()) {
      openPopup("error", { message: "Flag não pode ser vazia." });
      return;
    }

    const newFlag = flag.toUpperCase();

    const newFlagsUser = [...(user.flags || [])];
    if (!newFlagsUser.includes(newFlag)) {
      newFlagsUser.push(newFlag);
      updateStateKey(setUser, user, ["flags", newFlagsUser]);
      openPopup("success", { message: `Flag "${newFlag}" adicionada com sucesso.` });
      closePopup();
    } else {
      openPopup("error", { message: `Flag "${newFlag}" já existe.` });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className={styles.title}>
        <PixelIcon codename="flag" />
        {'Adicionar nova flag'}
      </h1>

      <main className={styles.scrollable}>
        <label htmlFor="adminFlagAdd_flag">Digite a flag a adicionar</label>
        <input
          type="text"
          id="adminFlagAdd_flag"
          name="flag"
          value={flag?.toUpperCase()}
          onChange={(e) => setFlag(e.target.value)}
          required
          autoFocus
          maxLength={30}
          placeholder="Ex: NOVAFLAG"
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
          label="Adicionar"
          icon='plus'
          type="submit"
        />
      </footer>
    </form>
  );
}
