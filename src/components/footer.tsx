export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Digital Store. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
