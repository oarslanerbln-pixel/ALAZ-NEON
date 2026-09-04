'use client';

import { useTranslation } from 'react-i18next';

export default function Disclaimer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-black text-yellow-400 p-4 border-t-2 border-cyan-400 text-center font-bold">
      <p>{t('Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.')}</p>
    </footer>
  );
}
