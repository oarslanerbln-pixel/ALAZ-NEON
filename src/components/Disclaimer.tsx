export default function Disclaimer() {
  return (
    <div className="w-full bg-[var(--background)] border-t-2 border-[var(--error)] p-4 mt-auto">
      <p className="text-[var(--error)] font-bold text-center text-lg">
        Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
      </p>
    </div>
  );
}