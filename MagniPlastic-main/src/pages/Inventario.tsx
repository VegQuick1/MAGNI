import { useState, useEffect } from "react";
import { SectionHeader } from "@/app/components/erp/SectionHeader";
import { inventory as seedInventory } from "@/data/mock";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useRole } from "@/context/RoleContext";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/app/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/app/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/app/components/ui/select";
import { Search, ArrowDownToLine, ArrowUpFromLine, MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchInventarioApi, registrarMovimientoInventario, crearItemInventario } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface Item {
  sku: string;
  name: string;
  category: string;
  location: string;
  stock: number;
  min: number;
  unit: string;
}

export default function Inventario() {
  const { isGerencia } = useRole();
  const [inventory, setInventory] = useState<Item[]>(seedInventory);
  const [q, setQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const loadData = async () => {
    try {
      const data = await fetchInventarioApi();
      if (data && data.length > 0) {
        setInventory(data);
      }
    } catch (err) {
      console.log("Usando datos locales por defecto", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = inventory.filter((i) => {
    const matchesSearch = i.sku.toLowerCase().includes(q.toLowerCase()) || i.name.toLowerCase().includes(q.toLowerCase());
    const matchesCat = selectedCategory === "Todos" || i.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Inventario"
        description="Materias primas, pigmentos, reproceso y empaque sincronizados con base de datos."
        actions={
          <div className="flex gap-2 flex-wrap items-center">
            {/* Quitamos el "isGerencia &&" para forzar que el botón siempre se muestre */}
            <NuevoMaterialDialog onSuccess={loadData} />
            <MovementDialog type="entrada" onSuccess={loadData} inventory={inventory} />
            <MovementDialog type="salida" onSuccess={loadData} inventory={inventory} />
          </div>
        }
      />

      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground" />
          <Input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="SKU o nombre…"
            className="pl-9 bg-surface-2 border-border font-mono text-base placeholder:font-sans h-11"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["Todos", "Resina", "Pigmento", "Reproceso", "Empaque"].map((c) => (
            <Badge
              key={c}
              onClick={() => setSelectedCategory(c)}
              variant="outline"
              className={cn(
                "cursor-pointer border-border text-sm font-bold transition-colors",
                selectedCategory === c ? "bg-accent text-accent-foreground border-accent" : "bg-surface-2 hover:border-accent"
              )}
            >
              {c}
            </Badge>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase font-bold">SKU</TableHead>
              <TableHead className="font-bold">Material</TableHead>
              <TableHead className="hidden md:table-cell font-bold">Categoría</TableHead>
              <TableHead className="hidden md:table-cell font-bold">Ubicación</TableHead>
              <TableHead className="text-right font-bold">Stock</TableHead>
              <TableHead className="text-right font-bold">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((i) => {
              const ratio = i.stock / (i.min || 100);
              const status = ratio < 0.5 ? "critico" : ratio < 1 ? "bajo" : "ok";
              return (
                <TableRow key={i.sku} className="border-border hover:bg-surface-2/40">
                  <TableCell className="font-mono text-sm text-foreground font-bold">{i.sku}</TableCell>
                  <TableCell className="font-bold text-base">{i.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-foreground font-bold">{i.category}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="inline-flex items-center gap-1 font-mono text-sm text-foreground font-bold">
                      <MapPin className="h-4 w-4" />{i.location}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {i.stock} <span className="text-foreground text-sm font-bold">{i.unit}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-md text-xs font-bold border",
                      status === "critico" && "bg-destructive/10 text-destructive border-destructive/30",
                      status === "bajo" && "bg-warning/10 text-warning border-warning/30",
                      status === "ok" && "bg-success/10 text-success border-success/30",
                    )}>
                      {status === "critico" ? "Crítico" : status === "bajo" ? "Bajo" : "OK"}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {!isGerencia && (
        <p className="text-sm text-foreground italic font-bold">
          Como operador puedes registrar entradas y salidas conectadas a la base de datos.
        </p>
      )}
    </div>
  );
}

function NuevoMaterialDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Resina");
  const [location, setLocation] = useState("");
  const [stock, setStock] = useState("");
  const [min, setMin] = useState("");
  const [unit, setUnit] = useState("pza");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!sku || !name) {
      toast({ title: "Faltan datos", description: "El SKU y el Nombre son obligatorios.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await crearItemInventario({
        sku,
        name,
        category,
        location: location || "Almacén General",
        stock: parseFloat(stock) || 0,
        min: parseFloat(min) || 50,
        unit,
      });
      toast({ title: "Éxito", description: "Nuevo material registrado en la base de datos." });
      onSuccess();
      setOpen(false);
      setSku(""); setName(""); setLocation(""); setStock(""); setMin("");
    } catch (error) {
      console.error("Error al crear material:", error);
      toast({ title: "Error", description: "No se pudo registrar el material en la BD.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-bold">
          <Plus className="h-4 w-4" /> Nuevo Material
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Dar de alta nuevo material</DialogTitle>
          <DialogDescription>Se añadirá directamente a la tabla de inventario.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <Input placeholder="SKU (ej. RES-001)" value={sku} onChange={(e) => setSku(e.target.value)} className="bg-surface-2 font-mono" />
          <Input placeholder="Nombre del Material" value={name} onChange={(e) => setName(e.target.value)} className="bg-surface-2" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-surface-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Resina">Resina</SelectItem>
              <SelectItem value="Pigmento">Pigmento</SelectItem>
              <SelectItem value="Reproceso">Reproceso</SelectItem>
              <SelectItem value="Empaque">Empaque</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Ubicación (ej. Almacén A-1)" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-surface-2" />
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="Stock Inicial" value={stock} onChange={(e) => setStock(e.target.value)} className="bg-surface-2 font-mono" />
            <Input type="number" placeholder="Stock Mínimo" value={min} onChange={(e) => setMin(e.target.value)} className="bg-surface-2 font-mono" />
          </div>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger className="bg-surface-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pza">Piezas (pza)</SelectItem>
              <SelectItem value="kg">Kilogramos (kg)</SelectItem>
              <SelectItem value="lt">Litros (lt)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? "Guardando..." : "Guardar Material"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MovementDialog({ type, onSuccess, inventory }: { type: "entrada" | "salida"; onSuccess: () => void; inventory: Item[] }) {
  const [open, setOpen] = useState(false);
  const [sku, setSku] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [lote, setLote] = useState("");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const isIn = type === "entrada";

  const handleConfirm = async () => {
    if (!sku || !cantidad) {
      toast({ title: "Faltan datos", description: "Selecciona un SKU y una cantidad válida.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await registrarMovimientoInventario({
        sku,
        tipo: type,
        cantidad: parseFloat(cantidad),
        lote,
        notas,
      });

      toast({ title: `Registro exitoso`, description: `Se registró la ${type} correctamente.` });
      onSuccess();
      setOpen(false);
      setSku("");
      setCantidad("");
      setLote("");
      setNotas("");
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      toast({ title: "Error", description: "No se pudo actualizar el inventario en la BD.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "h-10 gap-2",
            isIn ? "bg-success text-success-foreground hover:bg-success/90" : "bg-info text-info-foreground hover:bg-info/90",
          )}
        >
          {isIn ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
          Registrar {type}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display capitalize text-xl font-bold">Nueva {type} de material</DialogTitle>
          <DialogDescription className="text-base">Actualización directa en base de datos.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <label className="text-sm uppercase tracking-wider text-foreground font-bold">SKU</label>
            <Select value={sku} onValueChange={setSku}>
              <SelectTrigger className="h-12 bg-surface-2 border-border font-mono text-base">
                <SelectValue placeholder="Seleccionar material…" />
              </SelectTrigger>
              <SelectContent>
                {inventory.map((i) => (
                  <SelectItem key={i.sku} value={i.sku} className="font-mono text-sm">
                    {i.sku} — {i.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm uppercase tracking-wider text-foreground font-bold">Cantidad</label>
              <Input
                type="number"
                placeholder="0"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="h-12 bg-surface-2 border-border text-lg font-mono font-bold"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm uppercase tracking-wider text-foreground font-bold">Lote</label>
              <Input
                placeholder="L-2026-…"
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                className="h-12 bg-surface-2 border-border font-mono text-base"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <label className="text-sm uppercase tracking-wider text-foreground font-bold">Notas</label>
            <Input
              placeholder="Opcional"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="h-11 bg-surface-2 border-border text-base"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            disabled={loading}
            className={cn("min-w-32", isIn ? "bg-success text-success-foreground" : "bg-info text-info-foreground")}
            onClick={handleConfirm}
          >
            {loading ? "Guardando..." : `Confirmar ${type}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}