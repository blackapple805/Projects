// frontend/src/components/Footer.jsx
export default function Footer() {
    return (
      <footer className="fixed bottom-0 left-0 w-full bg-gray-100 text-center py-4 font-body text-sm z-50">
        <p>© {new Date().getFullYear()} YourBrand. All rights reserved.</p>
      </footer>
    );
  }
  