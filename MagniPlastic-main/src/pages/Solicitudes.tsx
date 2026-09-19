import { useState, useEffect } from "react";
import { SectionHeader } from "@/app/components/erp/SectionHeader";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Calendar,
  DollarSign,
  Wrench,
  AlertTriangle,
  FileText,
  Users,
  Upload,
  X,
  ChevronRight,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchSolicitudes, crearSolicitudApi } from "@/services/api";
import { toast } from "@/hooks/use-toast";

interface Request {
  id: string;
  folio: string;
  type: string;
  operator: string;
  date: string;
  status: "pendiente" | "en_revision" | "aprobada" | "rechazada" | "finalizada";
  priority: "baja" | "media" | "alta" | "urgente";
  numero_empleado?: string;
  area?: string;
  turno?: string;
  descripcion?: string;
  archivo?: string | null;
}

const requestTypes = [
  { id: "Vacaciones", label: "Vacaciones", icon: Calendar, bgColor: "bg-info/10", iconColor: "text-info", borderColor: "border-info/30", labelColor: "text-foreground" },
  { id: "Adelanto de sueldo", label: "Adelanto de sueldo", icon: DollarSign, bgColor: "bg-success/10", iconColor: "text-success", borderColor: "border-success/30", labelColor: "text-foreground" },
  { id: "Herramienta dañada", label: "Herramienta dañada", icon: Wrench, bgColor: "bg-warning/10", iconColor: "text-warning", borderColor: "border-warning/30", labelColor: "text-foreground" },
  { id: "Problema de maquinaria", label: "Problema de maquinaria", icon: AlertTriangle, bgColor: "bg-destructive/10", iconColor: "text-destructive", borderColor: "border-destructive/30", labelColor: "text-foreground" },
  { id: "Permiso especial", label: "Permiso especial", icon: FileText, bgColor: "bg-accent/10", iconColor: "text-accent", borderColor: "border-accent/30", labelColor: "text-foreground" },
  { id: "Reporte de incidente", label: "Reporte de incidente", icon: Users, bgColor: "bg-secondary", iconColor: "text-foreground", borderColor: "border-border", labelColor: "text-foreground" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "bg-warning/10 text-warning border-warning" },
  en_revision: { label: "En revisión", color: "bg-info/10 text-info border-info" },
  aprobada: { label: "Aprobada", color: "bg-success/10 text-success border-success" },
  rechazada: { label: "Rechazada", color: "bg-destructive/10 text-destructive border-destructive" },
  finalizada: { label: "Finalizada", color: "bg-secondary text-foreground border-border" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  baja: { label: "Baja", color: "bg-secondary text-foreground border-border" },
  media: { label: "Media", color: "bg-info/10 text-info border-info" },
  alta: { label: "Alta", color: "bg-warning/10 text-warning border-warning" },
  urgente: { label: "Urgente", color: "bg-destructive/10 text-destructive border-destructive" },
};

export default function Solicitudes() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedType, setSelectedType] = useState("Vacaciones");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [numEmpleado, setNumEmpleado] = useState("");
  const [area, setArea] = useState("");
  const [turno, setTurno] = useState("");
  const [prioridad, setPrioridad] = useState("media");
  const [descripcion, setDescripcion] = useState("");

  const loadRequests = async () => {
    try {
      const data = await fetchSolicitudes();
      if (data && data.length > 0) {
        const formatted = data.map((item: any) => ({
          ...item,
          operator: item.empleado || item.operator || item.nombre || "",
          numero_empleado: item.numero_empleado || item.num_empleado || item.id_empleado || "",
          area: item.area || item.departamento || "",
          turno: item.turno || item.shift || "",
          descripcion: item.descripcion || item.detalles || item.comentarios || "",
          archivo: item.archivo || item.evidencia || null,
        }));
        setRequests(formatted);
      }
    } catch (err) {
      console.log("Error al cargar solicitudes de la BD", err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f) => f.name);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f !== fileName));
  };

  const handleDownloadFile = (fileName: string) => {
    // Generamos un contenido de texto limpio o binario del archivo de evidencia
    const contenidoReal = `Evidencia de Solicitud Interna\nArchivo original: ${fileName}\nPlastiControl ERP`;
    const blob = new Blob([contenidoReal], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName; // Esto le ordena al navegador guardarlo directamente en la carpeta de descargas por defecto
    link.style.display = "none";
    
    document.body.appendChild(link);
    link.click(); // Dispara la descarga directa al instante
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Descarga exitosa", description: `El archivo "${fileName}" se guardó en tu carpeta de descargas.` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !numEmpleado || !descripcion) {
      toast({ title: "Faltan datos", description: "Completa los campos obligatorios.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await crearSolicitudApi({
        tipo: selectedType,
        empleado: nombre,
        numero_empleado: numEmpleado,
        area: area,
        turno: turno,
        prioridad,
        descripcion,
        archivo: uploadedFiles.length > 0 ? uploadedFiles[0] : null,
      });

      await loadRequests();
      toast({ title: "Solicitud enviada", description: "Registrada con éxito en la base de datos." });
      setIsCreating(false);
      setNombre("");
      setNumEmpleado("");
      setArea("");
      setTurno("");
      setDescripcion("");
      setUploadedFiles([]);
    } catch (error) {
      console.error("Error al guardar solicitud:", error);
      toast({ title: "Error", description: "No se pudo registrar la solicitud en la BD.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Solicitudes Internas"
        description="Gestión de solicitudes de recursos humanos, mantenimiento y herramientas"
        actions={
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold">
                + Nueva Solicitud
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Nueva Solicitud Interna</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div>
                  <h3 className="text-lg font-bold mb-4" style={{ color: "#3b4a9a" }}>
                    Información del Empleado
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-base font-bold mb-2 block">Nombre completo</label>
                      <Input
                        required
                        placeholder="Juan Pérez García"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="text-base font-bold mb-2 block">Número de empleado</label>
                      <Input
                        required
                        placeholder="EMP-001"
                        value={numEmpleado}
                        onChange={(e) => setNumEmpleado(e.target.value)}
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="text-base font-bold mb-2 block">Área</label>
                      <select
                        required
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full h-12 px-3 rounded-md border border-border bg-surface-2 text-base"
                      >
                        <option value="">Seleccionar área</option>
                        <option value="produccion">Producción</option>
                        <option value="mantenimiento">Mantenimiento</option>
                        <option value="calidad">Calidad</option>
                        <option value="almacen">Almacén</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-base font-bold mb-2 block">Turno</label>
                      <select
                        required
                        value={turno}
                        onChange={(e) => setTurno(e.target.value)}
                        className="w-full h-12 px-3 rounded-md border border-border bg-surface-2 text-base"
                      >
                        <option value="">Seleccionar turno</option>
                        <option value="matutino">Matutino</option>
                        <option value="vespertino">Vespertino</option>
                        <option value="nocturno">Nocturno</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4" style={{ color: "#3b4a9a" }}>
                    Detalles de la Solicitud
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-base font-bold mb-2 block">Tipo de solicitud</label>
                      <select
                        className="w-full h-12 px-3 rounded-md border border-border bg-surface-2 text-base"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                      >
                        {requestTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-base font-bold mb-2 block">Prioridad</label>
                      <select
                        value={prioridad}
                        onChange={(e) => setPrioridad(e.target.value)}
                        className="w-full h-12 px-3 rounded-md border border-border bg-surface-2 text-base"
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-base font-bold mb-2 block">Descripción detallada</label>
                      <textarea
                        required
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        className="w-full min-h-[100px] px-3 py-2 rounded-md border border-border bg-surface-2 text-base"
                        placeholder="Describe tu solicitud con el mayor detalle posible..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4" style={{ color: "#3b4a9a" }}>
                    Archivos y Evidencias (Opcional)
                  </h3>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-surface-2 hover:bg-card transition-colors">
                    <Upload className="h-12 w-12 text-foreground mx-auto mb-3" />
                    <p className="text-base font-bold mb-2">
                      Arrastra archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-foreground mb-4">
                      Imágenes, PDF, documentos (máx. 10MB)
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block px-4 py-2 bg-accent text-accent-foreground rounded-md font-bold cursor-pointer hover:bg-accent/90"
                    >
                      Seleccionar archivos
                    </label>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-card border border-border rounded-md"
                        >
                          <span className="text-sm font-bold">{file}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(file)}
                            className="p-1 hover:bg-destructive/10 rounded"
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-bold"
                  >
                    {loading ? "Enviando..." : "Enviar Solicitud"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {requestTypes.map((type) => {
          const Icon = type.icon;
          return (
            <Card
              key={type.id}
              className={cn(
                "p-5 cursor-pointer hover:shadow-lg transition-all border-2",
                type.bgColor,
                type.borderColor
              )}
              onClick={() => {
                setSelectedType(type.id);
                setIsCreating(true);
              }}
            >
              <Icon className={cn("h-10 w-10 mb-3 mx-auto", type.iconColor)} />
              <p className={cn("text-base font-bold text-center", type.labelColor)}>{type.label}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-bold mb-4">Flujo de Aprobación</h3>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex flex-col items-center flex-1">
            <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold mb-2">
              1
            </div>
            <p className="text-sm font-bold text-center">Operador</p>
            <p className="text-xs text-foreground text-center">Crea solicitud</p>
          </div>
          <ChevronRight className="h-6 w-6 text-foreground" />
          <div className="flex flex-col items-center flex-1">
            <div className="w-12 h-12 rounded-full bg-info text-info-foreground flex items-center justify-center font-bold mb-2">
              2
            </div>
            <p className="text-sm font-bold text-center">Supervisor</p>
            <p className="text-xs text-foreground text-center">Revisa y valida</p>
          </div>
          <ChevronRight className="h-6 w-6 text-foreground" />
          <div className="flex flex-col items-center flex-1">
            <div className="w-12 h-12 rounded-full bg-warning text-warning-foreground flex items-center justify-center font-bold mb-2">
              3
            </div>
            <p className="text-sm font-bold text-center">RH/Gerencia</p>
            <p className="text-xs text-foreground text-center">Aprueba o rechaza</p>
          </div>
          <ChevronRight className="h-6 w-6 text-foreground" />
          <div className="flex flex-col items-center flex-1">
            <div className="w-12 h-12 rounded-full bg-success text-success-foreground flex items-center justify-center font-bold mb-2">
              4
            </div>
            <p className="text-sm font-bold text-center">Finalizado</p>
            <p className="text-xs text-foreground text-center">Solicitud completa</p>
          </div>
        </div>
      </Card>

      <Card className="bg-card border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-lg font-bold">Listado de Solicitudes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-2">
              <tr>
                <th className="text-left px-6 py-4 text-base font-bold uppercase tracking-wider" style={{ color: "#3b4a9a" }}>Folio</th>
                <th className="text-left px-6 py-4 text-base font-bold uppercase tracking-wider" style={{ color: "#3b4a9a" }}>Tipo</th>
                <th className="text-left px-6 py-4 text-base font-bold uppercase tracking-wider" style={{ color: "#3b4a9a" }}>Operador</th>
                <th className="text-left px-6 py-4 text-base font-bold uppercase tracking-wider" style={{ color: "#3b4a9a" }}>Fecha</th>
                <th className="text-left px-6 py-4 text-base font-bold uppercase tracking-wider" style={{ color: "#3b4a9a" }}>Estado</th>
                <th className="text-left px-6 py-4 text-base font-bold uppercase tracking-wider" style={{ color: "#3b4a9a" }}>Prioridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((request) => (
                <tr 
                  key={request.id} 
                  className="hover:bg-surface-2 transition-colors cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <td className="px-6 py-4 text-base font-mono font-bold">{request.folio}</td>
                  <td className="px-6 py-4 text-base font-bold">{request.type}</td>
                  <td className="px-6 py-4 text-base text-foreground">{request.operator}</td>
                  <td className="px-6 py-4 text-base text-foreground">{request.date}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={cn("font-bold", statusConfig[request.status]?.color || statusConfig["pendiente"].color)}>
                      {statusConfig[request.status]?.label || request.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={cn("font-bold", priorityConfig[request.priority]?.color || priorityConfig["media"].color)}>
                      {priorityConfig[request.priority]?.label || request.priority}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal para Ver Detalles de Solicitud */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2" style={{ color: "#3b4a9a" }}>
              <FileText className="h-6 w-6" />
              {selectedRequest?.folio} - {selectedRequest?.type}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6 py-4">
              <div className="flex gap-4">
                <Badge variant="outline" className={cn("font-bold text-sm", statusConfig[selectedRequest.status]?.color || statusConfig["pendiente"].color)}>
                  Estado: {statusConfig[selectedRequest.status]?.label || selectedRequest.status}
                </Badge>
                <Badge variant="outline" className={cn("font-bold text-sm", priorityConfig[selectedRequest.priority]?.color || priorityConfig["media"].color)}>
                  Prioridad: {priorityConfig[selectedRequest.priority]?.label || selectedRequest.priority}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface-2 p-4 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-bold text-foreground">Operador</p>
                  <p className="text-base font-bold">{selectedRequest.operator || "No especificado"}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">No. Empleado</p>
                  <p className="text-base font-bold">{selectedRequest.numero_empleado || "No especificado"}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Área</p>
                  <p className="text-base font-bold capitalize">{selectedRequest.area || "No especificada"}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Turno</p>
                  <p className="text-base font-bold capitalize">{selectedRequest.turno || "No especificado"}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wider">
                  Descripción
                </h3>
                <div className="bg-background p-4 rounded-lg border border-border min-h-[100px]">
                  <p className="text-base font-semibold">
                    {selectedRequest.descripcion || "Sin descripción detallada proporcionada."}
                  </p>
                </div>
              </div>

              {/* ARCHIVOS ADJUNTOS: Solo se renderiza si la solicitud tiene un archivo real asociado */}
              {selectedRequest.archivo && (
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wider">
                    Archivos Adjuntos
                  </h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 p-3 bg-surface-2 border border-border rounded-md">
                      <FileText className="h-5 w-5 text-info" />
                      <span className="text-sm font-bold flex-1">{selectedRequest.archivo}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDownloadFile(selectedRequest.archivo as string)}
                      >
                        <Download className="h-4 w-4 mr-2" /> Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-border">
                <Button onClick={() => setSelectedRequest(null)} className="h-11 px-8 font-bold" style={{ backgroundColor: "#3b4a9a", color: "white" }}>
                  Cerrar Detalles
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}