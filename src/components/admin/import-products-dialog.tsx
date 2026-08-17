"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Loader2, Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { bulkUpdateProductsFromExcelAction } from "@/lib/actions/product-actions";

interface ImportProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportProductsDialog({ open, onOpenChange }: ImportProductsDialogProps) {
  const { toast } = useToast();
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({ variant: "error", title: "Pilih file terlebih dahulu" });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await bulkUpdateProductsFromExcelAction(formData);
    setLoading(false);

    if (!result.ok && result.error) {
      toast({ variant: "error", title: "Gagal memproses", description: result.error });
      return;
    }

    if (result.failedCount > 0) {
      toast({ 
        variant: "error", 
        title: "Import selesai dengan beberapa peringatan", 
        description: `Berhasil: ${result.successCount}, Gagal: ${result.failedCount}. Cek konsol browser untuk detail.` 
      });
      console.warn("Daftar gagal:", result.errors);
    } else {
      toast({ 
        variant: "success", 
        title: "Sukses mengupdate produk", 
        description: `${result.successCount} produk berhasil diupdate.` 
      });
      onOpenChange(false);
      setFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Update Massal via Excel
          </DialogTitle>
          <DialogDescription>
            Unggah file `.xlsx` atau `.csv` hasil export untuk meng-update harga, status visibilitas, atau data lainnya secara massal.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <strong>Perhatian:</strong> Jangan mengubah atau menghapus data pada kolom <code>ID</code>. Kolom ini digunakan oleh sistem untuk menemukan produk mana yang akan di-update.
              </div>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Input 
              id="file" 
              type="file" 
              accept=".xlsx, .csv" 
              onChange={handleFileChange}
              disabled={loading}
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                Terpilih: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleUpload} disabled={!file || loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Mulai Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
