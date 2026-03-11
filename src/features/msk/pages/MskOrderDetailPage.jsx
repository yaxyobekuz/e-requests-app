import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Printer } from "lucide-react";

import { mskAPI } from "@/shared/api";
import { MSK_ORDER_STATUSES } from "@/shared/data/request-statuses";
import { formatUzDate } from "@/shared/utils/formatDate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadcn/select";
import { uzEmblem } from "@/shared/assets/images";
import Button from "@/shared/components/ui/button/Button";

const STATUS_TRANSITIONS = {
  pending: ["in_review", "pending_confirmation", "rejected"],
  in_review: ["pending", "pending_confirmation", "rejected"],
  pending_confirmation: ["pending", "in_review", "rejected"],
};

const STATUS_LABELS = {
  pending: "Kutilmoqda",
  in_review: "Ko'rib chiqilmoqda",
  pending_confirmation: "Tasdiq kutilmoqda",
  rejected: "Rad etildi",
};

const MskOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");

  const handlePrint = () => {
    window.print();
  };

  const { data: order, isLoading } = useQuery({
    queryKey: ["msk-order-detail", id],
    queryFn: () => mskAPI.getOrderById(id).then((res) => res.data),
    onSuccess: (data) => {
      setNewStatus(data.status);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => mskAPI.updateOrderStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(["msk-order-detail", id]);
      toast.success("Status yangilandi!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  if (isLoading) {
    return <div className="p-6">Yuklanmoqda...</div>;
  }

  if (!order) {
    return <div className="p-6">Buyurtma topilmadi</div>;
  }

  const handleUpdate = () => {
    if (newStatus === "rejected" && !reason.trim()) {
      return toast.error("Rad etish sababi kiritilishi shart");
    }

    updateMutation.mutate({
      status: newStatus,
      rejectionReason: newStatus === "rejected" ? reason : undefined,
    });
  };

  const statusOptions = STATUS_TRANSITIONS[order.status] || [];
  const addressLabel = [
    order.address?.region?.name,
    order.address?.district?.name,
    order.address?.neighborhood?.name || order.address?.neighborhoodCustom,
    order.address?.street?.name || order.address?.streetCustom,
    order.address?.houseNumber ? `${order.address.houseNumber}-uy` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const isFormDisabled =
    updateMutation.isPending ||
    ["resolved", "rejected", "cancelled"].includes(order.status) ||
    statusOptions.length === 0;

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
      {/* Chap taraf: Asosiy hujjat (Print qilinadigan qism) */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border no-print">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </Button>
          <Button
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Chop etish (PDF)
          </Button>
        </div>

        <div
          id="doc"
          className="bg-white p-10 rounded-xl border shadow-sm print:shadow-none print:border-none print:m-0 printable-content"
        >
          {/* Emblem of Uzbekistan */}
          <img
            width={80}
            height={80}
            src={uzEmblem}
            alt="O'zbekiston gerbi"
            className="size-20 mx-auto mb-6"
          />

          <b className="block mb-6 font-bold text-center text-2xl">
            O'zbekiston Respublikasi Andijon viloyati <br /> Baliqchi tumani
            murojaatlar portali
          </b>

          {/* Divider */}
          <hr className="mb-6" />

          {/* Date & ID */}
          <div className="flex justify-between items-center mb-8 text-sm">
            <p>{formatUzDate(order.createdAt)}</p>
            <p>№ {order._id}</p>
          </div>

          <b className="block mb-6 font-semibold text-center text-lg">
            {addressLabel}da yashovchi Fuqaro {order.contactFirstName}{" "}
            {order.contactLastName}ning {order.category?.name} masalasi bo'yicha{" "}
            <br />
            <span className="uppercase">buyurtmasi</span>
          </b>

          <p className="mb-10 whitespace-pre-wrap leading-relaxed">
            {order.description}
          </p>

          <div className="grid grid-cols-2 gap-4 text-[15px] text-gray-800">
            <div className="space-y-4">
              <p>
                <span className="font-bold">F.I.Sh: </span>
                {order.contactFirstName} {order.contactLastName}
              </p>
              <p>
                <span className="font-bold">Tel: </span>
                {order.contactPhone}
              </p>
              <p className="col-span-2">
                <span className="font-bold">Yashash manzili: </span>
                {addressLabel}
              </p>
            </div>

            <div className="space-y-4">
              <p>
                <span className="font-bold">Kategoriya: </span>
                {order.category?.name}
              </p>
              <p>
                <span className="font-bold">Holati: </span>
                {STATUS_LABELS[order.status] ||
                  MSK_ORDER_STATUSES[order.status]?.label ||
                  order.status}
              </p>
              <p>
                <span className="font-bold">Yaratilgan: </span>
                {formatUzDate(order.createdAt)}
              </p>
              <p>
                <span className="font-bold">Yangilangan: </span>
                {formatUzDate(order.updatedAt)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-8 col-span-2">
              {order.status === "rejected" && order.rejectionReason && (
                <div className="col-span-2">
                  <p className="text-sm text-red-500 mb-1 font-medium">
                    Rad etish sababi:
                  </p>
                  <p className="font-semibold text-red-700">
                    {order.rejectionReason}
                  </p>
                </div>
              )}

              {order.status === "cancelled" && order.cancelReason && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1 font-medium">
                    Bekor qilish sababi:
                  </p>
                  <p className="font-semibold">{order.cancelReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* O'ng taraf: Holatni o'zgartirish (Faqat admin interfeysi) */}
      <div className="w-full md:w-80 space-y-4 shrink-0 print:hidden">
        <div className="bg-white p-5 rounded-xl border sticky top-6">
          <h2 className="font-semibold mb-4">Buyurtmani boshqarish</h2>

          {!isFormDisabled ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Statusni o'zgartirish
                </label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-full border rounded-lg text-sm bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={order.status}>
                      {STATUS_LABELS[order.status] ||
                        MSK_ORDER_STATUSES[order.status]?.label}
                    </SelectItem>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {newStatus === "rejected" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sabab *
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                    placeholder="Rad etish sababini yozing..."
                  />
                </div>
              )}

              <Button
                onClick={handleUpdate}
                disabled={
                  updateMutation.isPending || newStatus === order.status
                }
                className="w-full"
              >
                {updateMutation.isPending
                  ? "Saqlanmoqda..."
                  : "Statusni yangilash"}
              </Button>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
              Bu buyurtma holati yakunlangan (
              {MSK_ORDER_STATUSES[order.status]?.label}).
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MskOrderDetailPage;

