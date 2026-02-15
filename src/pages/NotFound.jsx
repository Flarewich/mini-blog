import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="text-gray-600 mt-2">Страница не найдена.</p>
      <Link className="inline-block mt-4 underline" to="/">
        На главную
      </Link>
    </div>
  );
}
