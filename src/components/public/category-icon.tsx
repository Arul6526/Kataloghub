import { 
  Laptop, Shirt, Utensils, Wrench, Home, Briefcase, Plug, 
  Smartphone, Book, Car, Heart, Box, Scissors, Palette, ShoppingBag
} from "lucide-react";

interface CategoryIconProps {
  name: string;
  className?: string;
}

export function CategoryIcon({ name, className }: CategoryIconProps) {
  const n = name.toLowerCase();
  
  if (n.includes("elektronik") || n.includes("komputer") || n.includes("laptop")) return <Laptop className={className} />;
  if (n.includes("pakaian") || n.includes("baju") || n.includes("fashion") || n.includes("kaos")) return <Shirt className={className} />;
  if (n.includes("makanan") || n.includes("minuman") || n.includes("kuliner") || n.includes("snack")) return <Utensils className={className} />;
  if (n.includes("alat") || n.includes("perkakas") || n.includes("hardware") || n.includes("mesin")) return <Wrench className={className} />;
  if (n.includes("rumah") || n.includes("perabot") || n.includes("furniture")) return <Home className={className} />;
  if (n.includes("kantor") || n.includes("atk") || n.includes("stationery") || n.includes("kerja")) return <Briefcase className={className} />;
  if (n.includes("kabel") || n.includes("listrik") || n.includes("elektrik")) return <Plug className={className} />;
  if (n.includes("gadget") || n.includes("hp") || n.includes("handphone") || n.includes("ponsel")) return <Smartphone className={className} />;
  if (n.includes("buku") || n.includes("cetak") || n.includes("kertas")) return <Book className={className} />;
  if (n.includes("otomotif") || n.includes("motor") || n.includes("mobil") || n.includes("sparepart")) return <Car className={className} />;
  if (n.includes("kesehatan") || n.includes("medis") || n.includes("obat") || n.includes("klinik")) return <Heart className={className} />;
  if (n.includes("kecantikan") || n.includes("kosmetik") || n.includes("salon")) return <Scissors className={className} />;
  if (n.includes("seni") || n.includes("desain") || n.includes("kriya")) return <Palette className={className} />;
  if (n.includes("tas") || n.includes("aksesoris")) return <ShoppingBag className={className} />;

  // Default fallback icon
  return <Box className={className} />;
}
