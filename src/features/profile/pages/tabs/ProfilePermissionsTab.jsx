import { useOutletContext } from "react-router-dom";
import { ACCESS_LABELS, ACCESS_COLORS } from "../../data/profile.data";

/**
 * Joriy foydalanuvchining ruxsatlarini ko'rsatuvchi tab komponenti (faqat ko'rish).
 * @returns {JSX.Element}
 */
const ProfilePermissionsTab = () => {
  const { user } = useOutletContext();
  const permissions = user?.permissions;

  const modules = [
    {
      key: "requests",
      label: "Murojaatlar",
      access: permissions?.requests?.access || "off",
      items: permissions?.requests?.allowedTypes || [],
      allLabel: "Barcha murojaat turlari",
    },
    {
      key: "services",
      label: "Xizmat arizalari",
      access: permissions?.services?.access || "off",
      items: permissions?.services?.allowedTypes || [],
      allLabel: "Barcha servislar",
    },
    {
      key: "msk",
      label: "MSK buyurtmalar",
      access: permissions?.msk?.access || "off",
      items: permissions?.msk?.allowedCategories || [],
      allLabel: "Barcha kategoriyalar",
    },
  ];

  const anyPermission = modules.some((m) => m.access !== "off");

  return (
    <div className="max-w-2xl space-y-4">
      {!anyPermission ? (
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Sizga hech qanday modul ruxsati berilmagan</p>
        </div>
      ) : (
        modules.map((mod) => (
          <div key={mod.key} className="bg-white border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{mod.label}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACCESS_COLORS[mod.access]}`}>
                {ACCESS_LABELS[mod.access]}
              </span>
            </div>

            {mod.access !== "off" && (
              <div className="text-sm text-gray-600">
                {mod.items.length === 0 ? (
                  <p className="text-gray-400">{mod.allLabel}</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {mod.items.map((item) => (
                      <span
                        key={item._id || item}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {item.name || item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ProfilePermissionsTab;
