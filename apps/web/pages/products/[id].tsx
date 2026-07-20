import { Product } from "../../types/src/product";

function ProductCard({ product }: { product: Product }) {
    return (
        <div>
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            {product.gpsr && (
                <div>
                    <p>Manufacturer: {product.gpsr.manufacturerName}</p>
                    <p>Address: {product.gpsr.manufacturerAddress}</p>
                    <p>Safety Contact: {product.gpsr.safetyContact}</p>
                </div>
            )}
        </div>
    );
)