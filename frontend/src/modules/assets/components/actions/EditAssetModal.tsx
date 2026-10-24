import Modal from "@/shared/components/ui/dialog/Modal";
// COMPONENT FORM - ORQUESTADOR
import EditAssetForm from "../forms/EditAssetForm";
// TYPES
import type { AssetCard } from "../../types";

interface Props {
  asset: AssetCard;
  open: boolean;
  onClose: () => void;
}

export default function EditAssetModal({ asset, open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Editar ${asset.codigoInventario}`}
    >
      <EditAssetForm asset={asset} onDone={onClose} />
    </Modal>
  );
}
