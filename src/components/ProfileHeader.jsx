import CoverUploader from "./CoverUploader";

export default function ProfileHeader({
  profile,
  avatarUrl,
  coverUrl,
  userId,
  onCoverUploaded,
  stats,
  t,
}) {
  return (
    <div className="rounded-3xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/80 dark:bg-zinc-900/60 shadow-sm overflow-hidden">
      {/* relative container */}
      <div className="relative">
        {/* Cover */}
        <div className="h-28 md:h-32 overflow-hidden">
          <CoverUploader
            userId={userId}
            coverUrl={coverUrl}
            onUploaded={onCoverUploaded}
          />
        </div>

        {/* Avatar absolute: half overlaps cover + body */}
        <div className="absolute left-5 bottom-0 translate-y-1/2">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-zinc-100 dark:bg-zinc-950 overflow-hidden shadow-lg">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">
                🙂
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body (добавляем padding-top под аватар) */}
      <div className="p-5 pt-14 md:pt-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          {/* left text (сдвигаем вправо из-за аватара) */}
          <div className="pl-24 md:pl-28">
            <div className="text-xl font-extrabold">
              {profile.full_name || profile.username || "User"}
            </div>

            {profile.username && (
              <div className="text-sm text-zinc-500">@{profile.username}</div>
            )}

            {profile.website && (
              <a
                className="text-sm underline text-zinc-700 dark:text-zinc-200"
                href={profile.website}
                target="_blank"
                rel="noreferrer"
              >
                {profile.website}
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-2 flex-wrap">
            <div className="px-3 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/30 text-sm">
              <b>{stats.posts}</b> {t("posts")}
            </div>
            <div className="px-3 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/30 text-sm">
              <b>{stats.likes}</b> ❤️
            </div>
            <div className="px-3 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/30 text-sm">
              <b>{stats.comments}</b> 💬
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
