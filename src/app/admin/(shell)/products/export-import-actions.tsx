"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileEdit } from "lucide-react";
import { ImportProductsDialog } from "@/components/admin/import-products-dialog";

export function ExportImportActions() {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <Button variant="outline" asChild>
        <a href="/api/admin/products/export" target="_blank" rel="noopener noreferrer">
          <Download className="mr-2 h-4 w-4" />
          Export
        </a>
      </Button>
      <Button variant="outline" onClick={() => setOpenDialog(true)}>
        <FileEdit className="mr-2 h-4 w-4" />
        Bulk Update
      </Button>
      <ImportProductsDialog open={openDialog} onOpenChange={setOpenDialog} />
    </>
  );
}
