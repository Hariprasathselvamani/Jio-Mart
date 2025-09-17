import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "../Context/AppContext";

const BestSeller = () => {
  const { products } = useAppContext(); // ✅ fixed (was product)

  console.log("BestSeller", products);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:gap-5 mt-6">
      {products &&
        products
          .filter((item) => item.inStock) // ✅ avoid name clash
          .slice(0, 5)
          .map((item) => <ProductCard key={item._id} product={item} />)}
    </div>
  );
};

export default BestSeller;
