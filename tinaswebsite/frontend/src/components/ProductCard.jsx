// frontend/src/components/ProductCard.jsx
export default function ProductCard({ product }) {
    return (
      <div className="group cursor-pointer">
        <div className="overflow-hidden rounded-lg shadow-lg">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110" 
          />
        </div>
        <h3 className="mt-4 font-display text-xl">{product.name}</h3>
        <p className="text-gray-600 font-body">${product.price}</p>
      </div>
    );
  }
  