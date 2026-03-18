import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Printer } from "lucide-react";
import Button from "@/shared/components/ui/button/Button";

import { requestsAPI, requestTypesAPI } from "@/shared/api";
import { authAPI } from "@/features/auth/api";
import { requestCategories } from "@/shared/data/request-categories";
import { formatUzDate } from "@/shared/utils/formatDate";
import { REQUEST_STATUSES } from "@/shared/data/request-statuses";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadcn/select";
import { uzEmblem } from "@/shared/assets/images";

const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [newStatus, setNewStatus] = useState("");
  const [newType, setNewType] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const handlePrint = () => {
    window.print();
  };

  const { data: user = {} } = useQuery({
    queryKey: ["auth", "me"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => authAPI.getMe().then((res) => res.data),
  });

  const canExecute =
    user.role === "owner" ||
    user.adminRole?.executionPermissions?.requests !== false;

  const { data: request, isLoading } = useQuery({
    queryKey: ["request-detail", id],
    queryFn: () => requestsAPI.getById(id).then((res) => res.data),
    onSuccess: (data) => {
      setNewStatus(data.status);
      if (data.type?._id) setNewType(data.type._id);
    },
  });

  const { data: requestTypes = [] } = useQuery({
    queryKey: ["request-types"],
    queryFn: () => requestTypesAPI.getAll().then((res) => res.data),
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => requestsAPI.updateStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["request-detail", id]);
      toast.success("Murojaat holati yangilandi");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    },
  });

  if (isLoading) {
    return <div className="p-6">Yuklanmoqda...</div>;
  }

  if (!request) {
    return <div className="p-6">Murojaat topilmadi</div>;
  }

  const getCategoryLabel = (catId) =>
    requestCategories.find((c) => c.id === catId)?.label || catId;

  const handleUpdate = () => {
    if (newStatus === "rejected" && !reason.trim()) {
      return toast.error("Rad etish sababi kiritilishi shart");
    }

    updateMutation.mutate({
      status: newStatus,
      rejectionReason: newStatus === "rejected" ? reason : undefined,
      closingNote: newStatus === "resolved" ? note : undefined,
      type: newType || null,
    });
  };

  const isFormDisabled =
    updateMutation.isPending ||
    ["resolved", "rejected", "cancelled"].includes(request.status);

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

        <div className="bg-white p-10 rounded-xl border shadow-sm print:shadow-none print:border-none print:m-0 printable-content">
          {/* Emblem of Uzbekistan */}
          <img
            width={80}
            height={80}
            src={uzEmblem}
            alt="O'zbekiston gerbi"
            className="size-20 mx-auto mb-6"
          />

          {/* Title */}
          <b className="block mb-6 font-bold text-center text-2xl">
            O'zbekiston Respublikasi Andijon viloyati <br /> Baliqchi tumani
            murojaatlar portali
          </b>

          {/* Divider */}
          <hr className="mb-6" />

          {/* Date & ID */}
          <div className="flex justify-between items-center mb-8 text-sm">
            <p>{formatUzDate(request.createdAt)}</p>
            <p>№ {request._id}</p>
          </div>

          {/* Subtitle */}
          <b className="block mb-6 font-semibold text-center text-lg">
            {request.address.region?.name}, {request.address?.district?.name},{" "}
            {request.address?.neighborhood?.name},{" "}
            {request.address?.street?.name}, {request.address?.houseNumber} -
            uyda yashovchi Fuqaro {request.contactFirstName}{" "}
            {request.contactLastName}ning {getCategoryLabel(request.category)}{" "}
            masalasi bo'yicha <span className="uppercase">murojaatnomasi</span>
          </b>

          {/* Request Description */}
          <p className="mb-10 whitespace-pre-wrap leading-relaxed">
            {request.description}
          </p>

          <div className="grid grid-cols-2 gap-4 text-[15px] text-gray-800">
            {/* Left */}
            <div className="space-y-4">
              {/* Full Name */}
              <p>
                <span className="font-bold">F.I.Sh: </span>
                {request.contactFirstName} {request.contactLastName}
              </p>

              {/* Tel */}
              <p>
                <span className="font-bold">Tel: </span>
                {request.contactPhone}
              </p>

              {/* Address */}
              <p className="col-span-2">
                <span className="font-bold">Yashash manzili: </span>
                {request.address?.region?.name},{" "}
                {request.address?.district?.name},{" "}
                {request.address?.neighborhood?.name},{" "}
                {request.address?.street?.name}
              </p>
            </div>

            {/* Right */}
            <div className="space-y-4">
              {/* Request Category */}
              <p>
                <span className="font-bold">Murojaat bo'limi: </span>
                {getCategoryLabel(request.category)}
              </p>

              {/* Request Type */}
              <p>
                <span className="font-bold">Murojaat turi: </span>
                {request.type?.name || "Belgilanmagan"}
              </p>

              {/* Status */}
              <p>
                <span className="font-bold">Holati: </span>
                {REQUEST_STATUSES[request.status]?.label || request.status}
              </p>

              {/* Created At */}
              <p>
                <span className="font-bold">Yaratilgan: </span>
                {formatUzDate(request.createdAt)}
              </p>

              {/* Updated At */}
              <p>
                <span className="font-bold">Hal qilingan: </span>
                {formatUzDate(request.updatedAt)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              {request.status === "rejected" && request.rejectionReason && (
                <div className="col-span-2">
                  <p className="text-sm text-red-500 mb-1 font-medium">
                    Rad etish sababi:
                  </p>
                  <p className="font-semibold text-red-700">
                    {request.rejectionReason}
                  </p>
                </div>
              )}

              {request.status === "cancelled" && request.cancelReason && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1 font-medium">
                    Bekor qilish sababi:
                  </p>
                  <p className="font-semibold">{request.cancelReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* O'ng taraf: Holatni o'zgartirish (Faqat admin interfeysi) */}
      {canExecute && <div className="w-full md:w-80 space-y-4 shrink-0 print:hidden">
        <div className="bg-white p-5 rounded-xl border sticky top-6">
          <h2 className="font-semibold mb-4">Murojaatni boshqarish</h2>

          {!isFormDisabled ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Murojaat turi
                </label>
                <Select
                  value={newType || "none"}
                  onValueChange={(val) => setNewType(val === "none" ? "" : val)}
                >
                  <SelectTrigger className="w-full border rounded-lg text-sm bg-white">
                    <SelectValue placeholder="Tanlanmagan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanlanmagan</SelectItem>
                    {requestTypes.map((t) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Statusni o'zgartirish
                </label>
                <Select
                  value={newStatus || request.status}
                  onValueChange={setNewStatus}
                >
                  <SelectTrigger className="w-full border rounded-lg text-sm bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Kutilmoqda</SelectItem>
                    <SelectItem value="in_review">
                      Ko'rib chiqilmoqda
                    </SelectItem>
                    <SelectItem value="resolved">Yechildi</SelectItem>
                    <SelectItem value="rejected">Rad etildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newStatus === "rejected" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Rad etish sababi *
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                    placeholder="Sababini yozing..."
                  />
                </div>
              )}

              {newStatus === "resolved" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Izoh (ixtiyoriy)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                    placeholder="Qo'shimcha izoh qoldiring..."
                  />
                </div>
              )}

              <Button
                onClick={handleUpdate}
                disabled={
                  updateMutation.isPending ||
                  (newStatus === request.status &&
                    newType === (request.type?._id || ""))
                }
                className="w-full"
              >
                {updateMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
              Bu murojaat holati allaqachon yakunlangan (
              {REQUEST_STATUSES[request.status]?.label}) va uni o'zgartirib
              bo'lmaydi.
            </div>
          )}
        </div>
      </div>}
    </div>
  );
};

export default RequestDetailPage;

