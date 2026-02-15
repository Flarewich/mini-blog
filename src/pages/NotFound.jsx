import { Link } from "react-router-dom";
import { useUi } from "../context/UiContext";

export default function NotFound() {
  const { t } = useUi();

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">{t("notFoundTitle")}</h1>
      <p className="text-zinc-600 dark:text-zinc-300 mt-2">{t("notFoundText")}</p>
      <Link className="inline-block mt-4 underline" to="/">
        {t("backHome")}
      </Link>
    </div>
  );
}
