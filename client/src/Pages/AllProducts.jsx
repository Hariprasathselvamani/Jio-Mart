import React, { useEffect, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import ProductCard from "../Components/ProductCard";

const AllProducts = () => {
  const { products = [], searchQuery = "" } = useAppContext(); // ✅ products not product
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setFilteredProducts(
        products.filter((p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(products);
    }
  }, [products, searchQuery]); // ✅ depends on products, not product

  return (
    <div className="mt-16 flex flex-col">
      <div className="flex flex-col items-end w-max">
        <p className="text-2xl font-medium uppercase">All Products</p>
        <div className="w-16 h-0.5 bg-primary-dull rounded-full"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-6 gap-3 md:gap-6">
        {filteredProducts
          .filter((p) => p?.inStock)
          .map((p, index) => (
            <ProductCard key={p._id || index} product={p} />
          ))}
      </div>
    </div>
  );
};

export default AllProducts;
